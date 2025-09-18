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
        const userRestaurantIds = await UserRestaurant.query()
          .where('user_id', user.id)
          .pluck('restaurant_id')
        
        if (userRestaurantIds.length > 0) {
          restaurants = await Restaurant.query()
            .whereIn('id', userRestaurantIds)
            .andWhere('isActive', true)
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
  async show({ params, response }: HttpContext) {
    return withSimpleAuth({ params, response } as HttpContext, async (ctx: AuthenticatedContext) => {
      try {
        const user = ctx.authenticatedUser
        const restaurant = await Restaurant.findOrFail(params.id)

        // Check if user can view this restaurant
        const canView = await this.bouncer.forUser(user).allows('RestaurantPolicy.view', restaurant)
        if (!canView) {
          return response.status(403).json({ error: 'Access denied to this restaurant' })
        }

        return response.ok({ data: restaurant })
      } catch (error: any) {
        console.error('Error fetching restaurant:', error)
        return response.status(500).json({ error: 'Failed to fetch restaurant' })
      }
    })
  }

  /**
   * Create a new restaurant
   */
  async store({ request, response }: HttpContext) {
    return withSimpleAuth({ request, response } as HttpContext, async (ctx: AuthenticatedContext) => {
      try {
        const user = ctx.authenticatedUser

        // Check if user can create restaurants
        const canCreate = await this.bouncer.forUser(user).allows('RestaurantPolicy.create')
        if (!canCreate) {
          return response.status(403).json({ error: 'You are not authorized to create restaurants' })
        }

        const data = request.only(['name', 'address', 'phone'])
        
        const restaurant = await Restaurant.create({
          ...data,
          ownerUserId: user.role === 'black_shirt' ? user.id : null,
          isActive: true
        })

        console.log(`Restaurant ${restaurant.id} created by ${user.email} (${user.role})`)

        return response.created({ data: restaurant })
      } catch (error: any) {
        console.error('Error creating restaurant:', error)
        if (error.message === 'Restaurant name must be unique' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return response.status(400).json({ error: 'Restaurant name must be unique' })
        }
        return response.status(500).json({ error: 'Failed to create restaurant' })
      }
    })
  }

  /**
   * Update a restaurant
   */
  async update({ params, request, response }: HttpContext) {
    return withSimpleAuth({ params, request, response } as HttpContext, async (ctx: AuthenticatedContext) => {
      try {
        const user = ctx.authenticatedUser
        const restaurant = await Restaurant.findOrFail(params.id)

        // Check if user can edit this restaurant
        const canEdit = await this.bouncer.forUser(user).allows('RestaurantPolicy.edit', restaurant)
        if (!canEdit) {
          return response.status(403).json({ error: 'You are not authorized to edit this restaurant' })
        }

        const data = request.only(['name', 'address', 'phone', 'isActive'])
        restaurant.merge(data)
        await restaurant.save()

        console.log(`Restaurant ${restaurant.id} updated by ${user.email} (${user.role})`)

        return response.ok({ data: restaurant })
      } catch (error: any) {
        console.error('Error updating restaurant:', error)
        if (error.message === 'Restaurant name must be unique' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return response.status(400).json({ error: 'Restaurant name must be unique' })
        }
        return response.status(500).json({ error: 'Failed to update restaurant' })
      }
    })
  }

  /**
   * Delete/deactivate a restaurant
   */
  async destroy({ params, response }: HttpContext) {
    return withSimpleAuth({ params, response } as HttpContext, async (ctx: AuthenticatedContext) => {
      try {
        const user = ctx.authenticatedUser
        const restaurant = await Restaurant.findOrFail(params.id)

        // Check if user can delete this restaurant
        const canDelete = await this.bouncer.forUser(user).allows('RestaurantPolicy.delete', restaurant)
        if (!canDelete) {
          return response.status(403).json({ error: 'You are not authorized to delete this restaurant' })
        }

        restaurant.isActive = false
        await restaurant.save()

        console.log(`Restaurant ${restaurant.id} deactivated by ${user.email} (${user.role})`)

        return response.ok({ message: 'Restaurant deactivated successfully' })
      } catch (error: any) {
        console.error('Error deleting restaurant:', error)
        return response.status(500).json({ error: 'Failed to delete restaurant' })
      }
    })
  }
}
