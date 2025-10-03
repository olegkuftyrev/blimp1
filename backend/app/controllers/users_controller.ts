import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserRestaurant from '#models/user_restaurant'
import UserPolicy from '#policies/user_policy'
import { DateTime } from 'luxon'

export default class UsersController {
  /**
   * Helper function to manually authenticate user from token
   */
  private async authenticateUser(request: any): Promise<User | null> {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
      }
      
      const token = authHeader.substring(7)
      
      // Find token in database using the hash
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default
        .from('auth_access_tokens')
        .where('hash', token)
        .first()
      
      if (!tokenRecord) {
        return null
      }
      
      // Find user
      const user = await User.find(tokenRecord.tokenable_id)
      return user
    } catch (error) {
      console.error('Authentication error:', error)
      return null
    }
  }

  /**
   * Test endpoint to get all users without auth
   */
  async testUsers({ response }: HttpContext) {
    try {
      const users = await User.query()
        .whereNull('deleted_at')
        .orderBy('created_at', 'desc')
        .limit(10)
      
      return response.json({
        success: true,
        data: users.map(user => ({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          jobTitle: user.jobTitle
        }))
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      })
    }
  }

  /**
   * Debug current user info - using simple auth
   */
  async debug({ request, response }: HttpContext) {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      
      // Find token in database (simple auth style)
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default
        .from('auth_access_tokens')
        .where('hash', token)
        .first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }
      
      // Find user
      const user = await User.find(tokenRecord.tokenable_id)
      if (!user) {
        return response.status(401).json({ error: 'User not found' })
      }

      return response.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          jobTitle: user.jobTitle
        }
      })
    } catch (error) {
      return response.status(401).json({
        success: false,
        message: 'Not authenticated',
        error: error.message
      })
    }
  }

  /**
   * Get team members for the current user's restaurants
   */
  async getTeamMembers({ auth, response }: HttpContext) {
    try {
      // Authenticate user using the API guard (same as /auth/me)
      await auth.authenticate()
      
      const currentUser = auth.user!
      console.log('getTeamMembers: Current user:', currentUser.id, currentUser.email, currentUser.role)
      
      // Check permission using policy
      const userPolicy = new UserPolicy()
      if (!(await userPolicy.viewUsersList(currentUser))) {
        return response.status(403).json({
          success: false,
          message: 'Insufficient permissions to view team members'
        })
      }

      let teamMembers: User[] = []

      if (currentUser.role === 'admin') {
        // Admin can see all users
        teamMembers = await User.query()
          .whereNull('deleted_at')
          .orderBy('created_at', 'desc')
      } else {
        // For non-admin users, get users from their assigned restaurants
        const userRestaurants = await UserRestaurant.query()
          .where('user_id', currentUser.id)
          .preload('restaurant')

        if (userRestaurants.length === 0) {
          return response.json({
            success: true,
            data: []
          })
        }

        // Get all user IDs from the same restaurants
        const restaurantIds = userRestaurants.map(ur => ur.restaurantId)
        const teamUserIds = await UserRestaurant.query()
          .whereIn('restaurant_id', restaurantIds)
          .select('user_id')
          .distinct()

        const userIds = teamUserIds.map(ur => ur.userId)

        // Get users from the same restaurants, excluding the current user
        teamMembers = await User.query()
          .whereIn('id', userIds)
          .where('id', '!=', currentUser.id)
          .whereNull('deleted_at')
          .orderBy('created_at', 'desc')
      }

      // For each user, get their restaurant assignments
      const teamMembersWithRestaurants = await Promise.all(
        teamMembers.map(async (user) => {
          if (user.role !== 'admin') {
            const userRestaurants = await UserRestaurant.query()
              .where('user_id', user.id)
              .preload('restaurant')

            return {
              ...user.toJSON(),
              restaurants: userRestaurants.map((ur) => ur.restaurant)
            }
          }
          return user.toJSON()
        })
      )

      return response.json({
        success: true,
        data: teamMembersWithRestaurants
      })
    } catch (error) {
      if (error.message === 'Unauthorized') {
        return // Response already sent
      }
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch team members',
        error: error.message
      })
    }
  }

  /**
   * Debug endpoint to check user visibility
   */
  async debugUsers({ auth, response }: HttpContext) {
    try {
      await auth.authenticate()
      const currentUser = auth.user!
      
      const users = await User.query()
        .preload('restaurants')
        .orderBy('id', 'asc')
      
      const debugInfo = {
        currentUser: {
          id: currentUser.id,
          fullName: currentUser.fullName,
          role: currentUser.role,
          email: currentUser.email
        },
        allUsers: users.map(user => ({
          id: user.id,
          fullName: user.fullName,
          role: user.role,
          email: user.email,
          restaurantIds: user.restaurants?.map(r => r.id) || []
        })),
        taiDoan: users.find(u => u.id === 37),
        nacho: users.find(u => u.fullName?.toLowerCase().includes('nacho'))
      }
      
      return response.json(debugInfo)
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  }

  /**
   * Fix Nacho's restaurant assignment
   */
  async fixNachoAssignment({ auth, response }: HttpContext) {
    try {
      await auth.authenticate()
      const currentUser = auth.user!
      
      // Only allow admin to run this fix
      if (currentUser.role !== 'admin') {
        return response.status(403).json({ error: 'Admin access required' })
      }
      
      // Find Nacho
      const nacho = await User.query().where('full_name', 'like', '%Nacho%').first()
      if (!nacho) {
        return response.status(404).json({ error: 'Nacho not found' })
      }
      
      console.log('👤 Found Nacho:', {id: nacho.id, fullName: nacho.fullName, role: nacho.role})
      
      // Check if association already exists
      const existingAssociation = await UserRestaurant.query()
        .where('user_id', nacho.id)
        .where('restaurant_id', 10)
        .first()
      
      if (existingAssociation) {
        return response.json({ 
          success: true, 
          message: 'Nacho already associated with restaurant 10',
          nacho: {id: nacho.id, fullName: nacho.fullName, role: nacho.role}
        })
      }
      
      // Create the association (using Tai Doan's ID as addedByUserId)
      await UserRestaurant.create({
        userId: nacho.id,
        restaurantId: 10,
        addedByUserId: 37 // Tai Doan's ID
      })
      
      console.log('✅ Successfully assigned Nacho to restaurant 10')
      
      // Verify the assignment
      const nachoRestaurants = await UserRestaurant.query().where('user_id', nacho.id)
      
      return response.json({
        success: true,
        message: 'Successfully assigned Nacho to restaurant 10',
        nacho: {id: nacho.id, fullName: nacho.fullName, role: nacho.role},
        restaurantIds: nachoRestaurants.map(r => r.restaurantId)
      })
      
    } catch (error) {
      console.error('❌ Error:', error.message)
      return response.status(500).json({ error: error.message })
    }
  }

  /**
   * Get all users with their restaurant assignments
   */
  async index({ auth, response }: HttpContext) {
    try {
      // Authenticate user using the API guard (same as /auth/me)
      await auth.authenticate()
      
      const currentUser = auth.user!
      
      // Check permission using policy
      const userPolicy = new UserPolicy()
      if (!(await userPolicy.viewUsersList(currentUser))) {
        return response.status(403).json({
          success: false,
          message: 'Insufficient permissions to view users list'
        })
      }

      let users = await User.query()
        .whereNull('deleted_at')
        .orderBy('created_at', 'desc')

      // Filter users based on current user's role
      if (currentUser.role === 'admin') {
        // Admin can see all users
      } else if (currentUser.role === 'ops_lead') {
        // Ops Lead can see admin, ops_lead, black_shirt, associate, and tablet
        users = users.filter(user => ['admin', 'ops_lead', 'black_shirt', 'associate', 'tablet'].includes(user.role))
      } else if (currentUser.role === 'black_shirt') {
        // Black Shirt can see admin, ops_lead, black_shirt, associate, and tablet
        users = users.filter(user => ['admin', 'ops_lead', 'black_shirt', 'associate', 'tablet'].includes(user.role))
      }
      // Associates should not reach this point due to policy restrictions

      // For each user, if they're not admin, get their restaurant assignments
      const usersWithRestaurants = await Promise.all(
        users.map(async (user) => {
          if (user.role !== 'admin') {
            const userRestaurants = await UserRestaurant.query()
              .where('user_id', user.id)
              .preload('restaurant')

            return {
              ...user.toJSON(),
              restaurants: userRestaurants.map((ur) => ur.restaurant)
            }
          }
          return user.toJSON()
        })
      )

      return response.json({
        success: true,
        data: usersWithRestaurants
      })
    } catch (error) {
      if (error.message === 'Unauthorized') {
        return // Response already sent
      }
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      })
    }
  }

  /**
   * Create a new user
   */
  async store({ auth, request, response }: HttpContext) {
    try {
      // Authenticate user using the API guard (same as /auth/me)
      await auth.authenticate()
      
      const currentUser = auth.user!
      
      const { fullName, email, password, role, jobTitle, restaurantIds = [] } = request.only([
        'fullName',
        'email', 
        'password',
        'role',
        'jobTitle',
        'restaurantIds'
      ])

      // Check permission using policy
      const userPolicy = new UserPolicy()
      if (!(await userPolicy.createUser(currentUser, role))) {
        return response.status(403).json({
          success: false,
          message: 'Insufficient permissions to create user with this role'
        })
      }

      // Create the user
      const user = await User.create({
        fullName,
        email,
        password,
        role,
        jobTitle
      })

      // If user is not admin and has restaurant assignments, create them
      if (role !== 'admin' && restaurantIds.length > 0) {
        const restaurantAssignments = restaurantIds.map((restaurantId: number) => ({
          userId: user.id,
          restaurantId,
          addedByUserId: currentUser.id
        }))

        await UserRestaurant.createMany(restaurantAssignments)
      }

      return response.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      })
    } catch (error) {
      if (error.message === 'Unauthorized') {
        return // Response already sent
      }
      return response.status(400).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      })
    }
  }

  /**
   * Update a user
   */
  async update({ auth, params, request, response }: HttpContext) {
    try {
      // Authenticate user using the API guard (same as /auth/me)
      await auth.authenticate()
      
      const currentUser = auth.user!
      const targetUser = await User.findOrFail(params.id)
      
      // Check permission using policy
      const userPolicy = new UserPolicy()
      if (!(await userPolicy.editProfile(currentUser, targetUser))) {
        return response.status(403).json({
          success: false,
          message: 'Insufficient permissions to edit this user'
        })
      }

      const { fullName, email, role, jobTitle, restaurantIds = [] } = request.only([
        'fullName',
        'email',
        'role', 
        'jobTitle',
        'restaurantIds'
      ])

      // Update user basic info
      targetUser.merge({ fullName, email, role, jobTitle })
      await targetUser.save()

      // Handle restaurant assignments for non-admin users
      if (role !== 'admin') {
        // Remove existing assignments
        await UserRestaurant.query().where('user_id', targetUser.id).delete()
        
        // Add new assignments
        if (restaurantIds.length > 0) {
          const restaurantAssignments = restaurantIds.map((restaurantId: number) => ({
            userId: targetUser.id,
            restaurantId,
            addedByUserId: currentUser.id
          }))

          await UserRestaurant.createMany(restaurantAssignments)
        }
      } else {
        // If user is admin, remove all restaurant assignments
        await UserRestaurant.query().where('user_id', targetUser.id).delete()
      }

      return response.json({
        success: true,
        data: targetUser,
        message: 'User updated successfully'
      })
    } catch (error) {
      if (error.message === 'Unauthorized') {
        return // Response already sent
      }
      return response.status(400).json({
        success: false,
        message: 'Failed to update user',
        error: error.message
      })
    }
  }

  /**
   * Delete a user (soft delete)
   */
  async destroy({ auth, params, response }: HttpContext) {
    try {
      // Authenticate user using the API guard (same as /auth/me)
      await auth.authenticate()
      
      const currentUser = auth.user!
      const targetUser = await User.findOrFail(params.id)
      
      // Check permission using policy
      const userPolicy = new UserPolicy()
      if (!(await userPolicy.deleteUser(currentUser, targetUser))) {
        return response.status(403).json({
          success: false,
          message: 'Insufficient permissions to delete this user'
        })
      }
      
      // Soft delete
      targetUser.deletedAt = DateTime.now()
      await targetUser.save()

      // Also remove restaurant assignments
      await UserRestaurant.query().where('user_id', targetUser.id).delete()

      return response.json({
        success: true,
        message: 'User deleted successfully'
      })
    } catch (error) {
      if (error.message === 'Unauthorized') {
        return // Response already sent
      }
      return response.status(400).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message
      })
    }
  }
}
