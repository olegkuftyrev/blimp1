import type { HttpContext } from '@adonisjs/core/http'
import Restaurant from '#models/restaurant'
import { getAuthenticatedUser } from '#utils/simple_auth_helper'
import UserRestaurant from '#models/user_restaurant'

export default class SimpleRestaurantsController {

  /**
   * Get all restaurants user has access to
   */
  async index({ request, response }: HttpContext) {
    try {
      const user = await getAuthenticatedUser({ request, response } as HttpContext)
      if (!user) {
        return response.status(401).json({ error: 'Authentication required' })
      }

      console.log(`${user.email} (${user.role}) requesting restaurants`)

      let restaurants: Restaurant[] = []

      if (user.role === 'admin') {
        // Admin sees all restaurants
        restaurants = await Restaurant.query().where('isActive', true)
        console.log(`Admin accessing all ${restaurants.length} restaurants`)
      } else {
        // Get restaurants user has access to
        console.log(`Looking for restaurants for user ${user.id} (${user.email})`)
        
        const userRestaurants = await UserRestaurant.query()
          .where('user_id', user.id)
          .select('restaurant_id')
        
        console.log(`Found ${userRestaurants.length} user-restaurant records:`, userRestaurants)
        const userRestaurantIds = userRestaurants.map(ur => ur.restaurantId)
        console.log(`Restaurant IDs:`, userRestaurantIds)
        
        if (userRestaurantIds.length > 0) {
          restaurants = await Restaurant.query()
            .whereIn('id', userRestaurantIds)
            .andWhere('isActive', true)
          console.log(`Found ${restaurants.length} active restaurants from IDs`)
        } else {
          console.log(`No restaurant assignments found for user ${user.id}`)
        }
        
        console.log(`User ${user.email} (${user.role}) has access to ${restaurants.length} restaurants`)
      }

      return response.ok({ data: restaurants })
    } catch (error: any) {
      console.error('Error fetching restaurants:', error)
      return response.status(500).json({ error: 'Failed to fetch restaurants' })
    }
  }

  /**
   * Get a specific restaurant
   */
  async show({ params, request, response }: HttpContext) {
    try {
      const user = await getAuthenticatedUser({ request, response } as HttpContext)
      if (!user) {
        return response.status(401).json({ error: 'Authentication required' })
      }

      const restaurant = await Restaurant.findOrFail(params.id)

      // Check if user has access to this restaurant
      if (user.role !== 'admin') {
        const userRestaurant = await UserRestaurant.query()
          .where('user_id', user.id)
          .where('restaurant_id', restaurant.id)
          .first()
        
        if (!userRestaurant) {
          return response.status(403).json({ error: 'Access denied to this restaurant' })
        }
      }

      return response.ok({ data: restaurant })
    } catch (error: any) {
      console.error('Error fetching restaurant:', error)
      return response.status(500).json({ error: 'Failed to fetch restaurant' })
    }
  }

  // TODO: Implement create, update, delete methods with proper authentication
}
