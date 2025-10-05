import type { HttpContext } from '@adonisjs/core/http'
import Restaurant from '#models/restaurant'
import User from '#models/user'
import UserRestaurant from '#models/user_restaurant'
import Database from '@adonisjs/lucid/services/db'
import { manageRestaurants } from '#abilities/main'

export default class RestaurantsController {
  /**
   * Display a list of restaurants
   */
  async index({ request, response, auth }: HttpContext) {
    try {
      const qs = request.qs()
      const includeInactive = qs.includeInactive === '1' || qs.includeInactive === 'true'

      const user = auth.user

      // Admins see all restaurants
      if (user && user.role === 'admin') {
        if (includeInactive) {
          const [activeRestaurants, inactiveRestaurants] = await Promise.all([
            Restaurant.query().where('isActive', true),
            Restaurant.query().where('isActive', false),
          ])
          const [activeWithACO, inactiveWithACO] = await Promise.all([
            this.addACODataToRestaurants(activeRestaurants),
            this.addACODataToRestaurants(inactiveRestaurants)
          ])
          return response.ok({ data: { active: activeWithACO, inactive: inactiveWithACO } })
        }

        const restaurants = await Restaurant.query().where('isActive', true)
        const restaurantsWithACO = await this.addACODataToRestaurants(restaurants)
        return response.ok({ data: restaurantsWithACO })
      }

      // Non-admins: scope to restaurants assigned to the authenticated user
      const userId = user?.id

      if (!userId) {
        return response.unauthorized({ error: 'Authentication required' })
      }

      const userRestaurantRecords = await UserRestaurant.query()
        .where('user_id', userId)
        .select('restaurant_id')

      const userRestaurantIds = userRestaurantRecords.map((ur) => ur.restaurantId)

      if (includeInactive) {
        const [activeRestaurants, inactiveRestaurants] = await Promise.all([
          Restaurant.query().whereIn('id', userRestaurantIds).andWhere('isActive', true),
          Restaurant.query().whereIn('id', userRestaurantIds).andWhere('isActive', false),
        ])
        const [activeWithACO, inactiveWithACO] = await Promise.all([
          this.addACODataToRestaurants(activeRestaurants),
          this.addACODataToRestaurants(inactiveRestaurants)
        ])
        return response.ok({ data: { active: activeWithACO, inactive: inactiveWithACO } })
      }

      const restaurants = userRestaurantIds.length > 0
        ? await Restaurant.query().whereIn('id', userRestaurantIds).andWhere('isActive', true)
        : []
      const restaurantsWithACO = await this.addACODataToRestaurants(restaurants)

      return response.ok({ data: restaurantsWithACO })
    } catch (error) {
      return response.badRequest({ error: 'Failed to fetch restaurants' })
    }
  }

  /**
   * Display a single restaurant
   */
  async show({ params, response }: HttpContext) {
    try {
      const restaurant = await Restaurant.findOrFail(params.id)
      return response.ok({ data: restaurant })
    } catch (error) {
      return response.notFound({ error: 'Restaurant not found' })
    }
  }

  /**
   * Create a new restaurant
   */
  async store({ request, response, auth, bouncer }: HttpContext) {
    try {
      const user = auth.user!
      const data = request.only(['name', 'address', 'phone'])
      const temp = new Restaurant()
      temp.ownerUserId = user.role === 'black_shirt' ? user.id : null
      await bouncer.authorize(manageRestaurants, temp)

      const restaurant = await Restaurant.create({ ...data, ownerUserId: temp.ownerUserId ?? null, isActive: true })
      
      // Automatically create a tablet user for the restaurant
      await this.createTabletUserForRestaurant(restaurant, user.id)
      
      return response.created({ data: restaurant })
    } catch (error: any) {
      if (error.message === 'Restaurant name must be unique' || error.code === '23505') {
        return response.badRequest({ error: 'Restaurant name must be unique' })
      }
      return response.badRequest({ error: 'Failed to create restaurant' })
    }
  }

  /**
   * Add ACO information to restaurants
   */
  private async addACODataToRestaurants(restaurants: any[]) {
    if (restaurants.length === 0) return []
    
    try {
      // Get all ACO users first
      const acoUsers = await User.query().where('jobTitle', 'ACO')
      
      // Get all user-restaurant relationships for ACO users
      const acoRelations = []
      for (const acoUser of acoUsers) {
        const userRestaurants = await UserRestaurant.query()
          .where('userId', acoUser.id)
          .select('restaurantId')
        
        for (const ur of userRestaurants) {
          acoRelations.push({
            restaurant_id: ur.restaurantId,
            aco_id: acoUser.id,
            aco_name: acoUser.fullName,
            aco_email: acoUser.email
          })
        }
      }
      
      // Map ACO data to restaurants
      const acoMap = new Map()
      acoRelations.forEach(relation => {
        acoMap.set(relation.restaurant_id, {
          acoId: relation.aco_id,
          acoName: relation.aco_name,
          acoEmail: relation.aco_email
        })
      })
      
      // Add ACO data to restaurants
      return restaurants.map(restaurant => {
        const acoData = acoMap.get(restaurant.id)
        return {
          ...restaurant.toJSON(),
          acoId: acoData?.acoId || null,
          acoName: acoData?.acoName || null,
          acoEmail: acoData?.acoEmail || null
        }
      })
    } catch (error) {
      // If ACO data fetching fails, return restaurants without ACO data
      console.error('Error fetching ACO data:', error)
      return restaurants.map(restaurant => ({
        ...restaurant.toJSON(),
        acoId: null,
        acoName: null,
        acoEmail: null
      }))
    }
  }

  /**
   * Create a tablet user for a restaurant
   */
  private async createTabletUserForRestaurant(restaurant: Restaurant, createdByUserId: number) {
    try {
      // Extract restaurant identifier from name (e.g., "Panda Express PX2475" -> "px2475")
      const restaurantIdentifier = restaurant.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
        .replace(/pandaexpress/g, '') // Remove "pandaexpress" if present
        .trim()

      // Generate user credentials based on restaurant identifier
      const tabletUserData = {
        fullName: restaurantIdentifier,
        email: `${restaurantIdentifier}@pandarg.com`,
        password: `${restaurantIdentifier}${restaurantIdentifier}`, // Double the identifier as password
        role: 'tablet' as const,
        jobTitle: 'Hourly Associate' as const
      }

      // Check if user already exists
      const existingUser = await User.findBy('email', tabletUserData.email)
      if (existingUser) {
        console.log(`Tablet user already exists for restaurant ${restaurant.name}: ${tabletUserData.email}`)
        return existingUser
      }

      // Create the tablet user
      const tabletUser = await User.create(tabletUserData)
      console.log(`Created tablet user for restaurant ${restaurant.name}: ${tabletUserData.email}`)

      // Assign the user to the restaurant
      await UserRestaurant.create({
        userId: tabletUser.id,
        restaurantId: restaurant.id,
        addedByUserId: createdByUserId
      })

      return tabletUser
    } catch (error: any) {
      console.error(`Failed to create tablet user for restaurant ${restaurant.name}:`, error.message)
      // Don't throw the error - we don't want restaurant creation to fail if user creation fails
      return null
    }
  }

  /**
   * Update a restaurant
   */
  async update({ params, request, response, bouncer }: HttpContext) {
    try {
      const restaurant = await Restaurant.findOrFail(params.id)
      await bouncer.authorize(manageRestaurants, restaurant)
      const data = request.only(['name', 'address', 'phone', 'isActive'])
      restaurant.merge(data)
      await restaurant.save()
      return response.ok({ data: restaurant })
    } catch (error: any) {
      if (error.message === 'Restaurant name must be unique' || error.code === '23505') {
        return response.badRequest({ error: 'Restaurant name must be unique' })
      }
      return response.badRequest({ error: 'Failed to update restaurant' })
    }
  }

  /**
   * Delete a restaurant
   */
  async destroy({ params, response, bouncer }: HttpContext) {
    try {
      const restaurant = await Restaurant.findOrFail(params.id)
      await bouncer.authorize(manageRestaurants, restaurant)
      restaurant.isActive = false
      await restaurant.save()
      return response.ok({ message: 'Restaurant deactivated successfully' })
    } catch (error) {
      return response.badRequest({ error: 'Failed to delete restaurant' })
    }
  }
}