import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Restaurant from '#models/restaurant'
import User from '#models/user'
import UserRestaurant from '#models/user_restaurant'
import IdpAssessment from '#models/idp_assessment'
import IdpAssessmentAnswer from '#models/idp_assessment_answer'
import IdpRole from '#models/idp_role'
import IdpQuestion from '#models/idp_question'

export default class extends BaseSeeder {
  async run() {
    console.log('🔄 Starting additional data seeder...')
    
    try {
      // Check dependencies first
      const existingUsers = await User.all()
      const existingRestaurants = await Restaurant.all()
      const existingIdpRoles = await IdpRole.all()
      
      if (existingUsers.length === 0) {
        console.log('⚠️ No users found. Please run admin_user_seeder first.')
        return
      }
      if (existingRestaurants.length === 0) {
        console.log('⚠️ No restaurants found. Please run restaurant_seeder first.')
        return
      }
      if (existingIdpRoles.length === 0) {
        console.log('⚠️ No IDP roles found. Please run idp_role_seeder first.')
        return
      }
      // Create 2 additional restaurants
      console.log('🏗️ Creating additional restaurants...')
      const additionalRestaurants = [
        {
          name: 'Panda Express PX4512',
          address: '321 Commerce Boulevard, Business District',
          phone: '(555) 456-7890',
          isActive: true
        },
        {
          name: 'Panda Express PX5634',
          address: '654 Market Street, Shopping Center',
          phone: '(555) 567-8901',
          isActive: true
        }
      ]

      const createdRestaurants = []
      for (const restaurantData of additionalRestaurants) {
        const existing = await Restaurant.findBy('name', restaurantData.name)
        if (!existing) {
          const restaurant = await Restaurant.create(restaurantData)
          createdRestaurants.push(restaurant)
          console.log(`✅ Created restaurant: ${restaurant.name}`)
        } else {
          createdRestaurants.push(existing)
          console.log(`ℹ️ Restaurant already exists: ${restaurantData.name}`)
        }
      }

      // Get all restaurants for user assignment
      const allRestaurants = await Restaurant.all()
      console.log(`📊 Total restaurants available: ${allRestaurants.length}`)

      // Create 10 users with different roles
      console.log('👥 Creating additional users...')
      const users = [
        {
          fullName: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          password: 'password123',
          role: 'black_shirt' as const,
          jobTitle: 'SM/GM/TL' as const
        },
        {
          fullName: 'Mike Chen',
          email: 'mike.chen@example.com',
          password: 'password123',
          role: 'black_shirt' as const,
          jobTitle: 'AM' as const
        },
        {
          fullName: 'Emma Rodriguez',
          email: 'emma.rodriguez@example.com',
          password: 'password123',
          role: 'associate' as const,
          jobTitle: 'Hourly Associate' as const
        },
        {
          fullName: 'David Kim',
          email: 'david.kim@example.com',
          password: 'password123',
          role: 'associate' as const,
          jobTitle: 'Hourly Associate' as const
        },
        {
          fullName: 'Lisa Thompson',
          email: 'lisa.thompson@example.com',
          password: 'password123',
          role: 'black_shirt' as const,
          jobTitle: 'Chef' as const
        },
        {
          fullName: 'James Wilson',
          email: 'james.wilson@example.com',
          password: 'password123',
          role: 'associate' as const,
          jobTitle: 'Hourly Associate' as const
        },
        {
          fullName: 'Maria Garcia',
          email: 'maria.garcia@example.com',
          password: 'password123',
          role: 'black_shirt' as const,
          jobTitle: 'SM/GM/TL' as const
        },
        {
          fullName: 'Alex Brown',
          email: 'alex.brown@example.com',
          password: 'password123',
          role: 'associate' as const,
          jobTitle: 'Hourly Associate' as const
        },
        {
          fullName: 'Jennifer Lee',
          email: 'jennifer.lee@example.com',
          password: 'password123',
          role: 'black_shirt' as const,
          jobTitle: 'AM' as const
        },
        {
          fullName: 'Robert Davis',
          email: 'robert.davis@example.com',
          password: 'password123',
          role: 'associate' as const,
          jobTitle: 'Hourly Associate' as const
        },
        {
          fullName: 'Tylene Parker',
          email: 'tylene.parker@pandarg.com',
          password: 'tylene2874',
          role: 'black_shirt' as const,
          jobTitle: 'SM/GM/TL' as const
        }
      ]

      const createdUsers = []
      for (const userData of users) {
        const existing = await User.findBy('email', userData.email)
        if (!existing) {
          const user = await User.create(userData)
          createdUsers.push(user)
          console.log(`✅ Created user: ${user.fullName} (${user.role})`)
        } else {
          createdUsers.push(existing)
          console.log(`ℹ️ User already exists: ${userData.email}`)
        }
      }

      // Assign users to restaurants (random assignment)
      console.log('🏪 Assigning users to restaurants...')
      for (const user of createdUsers) {
        // Randomly assign 1-3 restaurants per user
        const numRestaurants = Math.floor(Math.random() * 3) + 1
        const shuffledRestaurants = [...allRestaurants].sort(() => 0.5 - Math.random())
        const assignedRestaurants = shuffledRestaurants.slice(0, numRestaurants)

        for (const restaurant of assignedRestaurants) {
          const existing = await UserRestaurant.query()
            .where('user_id', user.id)
            .where('restaurant_id', restaurant.id)
            .first()

          if (!existing) {
            await UserRestaurant.create({
              userId: user.id,
              restaurantId: restaurant.id
            })
            console.log(`  📍 Assigned ${user.fullName} to ${restaurant.name}`)
          }
        }
      }

      // Create IDP assessments with random results
      console.log('📊 Creating IDP assessments with random results...')
      
      // Get IDP roles
      const idpRoles = await IdpRole.all()
      const roleMap = new Map(idpRoles.map(role => [role.userRole, role]))

      for (const user of createdUsers) {
        const idpRole = roleMap.get(user.role)
        if (!idpRole) {
          console.log(`⚠️ No IDP role found for user role: ${user.role}`)
          continue
        }

        // Check if assessment already exists
        const existingAssessment = await IdpAssessment.query()
          .where('user_id', user.id)
          .where('is_active', true)
          .first()

        if (existingAssessment) {
          console.log(`ℹ️ Assessment already exists for ${user.fullName}`)
          continue
        }

        // Create assessment
        const randomDaysAgo = Math.floor(Math.random() * 30)
        const assessment = await IdpAssessment.create({
          userId: user.id,
          roleId: idpRole.id,
          version: 1,
          status: 'completed',
          isActive: true,
          startedAt: DateTime.now().minus({ days: randomDaysAgo }),
          completedAt: DateTime.now().minus({ days: randomDaysAgo - Math.floor(Math.random() * 3) })
        })

        // Get questions for this role
        const questions = await IdpQuestion.query()
          .whereHas('competency', (query) => {
            query.where('role_id', idpRole.id)
          })
          .preload('competency')

        console.log(`  📝 Creating ${questions.length} answers for ${user.fullName}`)

        // Create random answers
        for (const question of questions) {
          // Random yes/no answer (70% chance of yes for better distribution)
          const answer = Math.random() < 0.7 ? 'yes' : 'no'
          
          await IdpAssessmentAnswer.create({
            assessmentId: assessment.id,
            questionId: question.id,
            answer: answer
          })
        }

        console.log(`✅ Created IDP assessment for ${user.fullName}`)
      }

      console.log('✅ Additional data seeded successfully!')
      
      // Summary
      console.log(`📊 Summary:`)
      console.log(`   - Restaurants created: ${additionalRestaurants.length}`)
      console.log(`   - Users created: ${users.length}`)
      console.log(`   - IDP assessments created: ${createdUsers.length}`)
      
    } catch (error) {
      console.error('❌ Error in additional data seeder:', error)
      throw error
    }
  }
}
