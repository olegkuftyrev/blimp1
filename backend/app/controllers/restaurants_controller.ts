import type { HttpContext } from '@adonisjs/core/http'
import Restaurant from '#models/restaurant'
import { manageRestaurants } from '#abilities/main'

export default class RestaurantsController {
  /**
   * Display a list of restaurants
   */
  async index({ response }: HttpContext) {
    try {
      const restaurants = await Restaurant.query().where('isActive', true)
      return response.ok({ data: restaurants })
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
      return response.created({ data: restaurant })
    } catch (error: any) {
      if (error.message === 'Restaurant name must be unique' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return response.badRequest({ error: 'Restaurant name must be unique' })
      }
      return response.badRequest({ error: 'Failed to create restaurant' })
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
      if (error.message === 'Restaurant name must be unique' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
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