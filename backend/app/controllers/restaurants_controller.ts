import type { HttpContext } from '@adonisjs/core/http'
import Restaurant from '#models/restaurant'

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
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['name', 'address', 'phone'])
      const restaurant = await Restaurant.create(data)
      return response.created({ data: restaurant })
    } catch (error) {
      return response.badRequest({ error: 'Failed to create restaurant' })
    }
  }

  /**
   * Update a restaurant
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const restaurant = await Restaurant.findOrFail(params.id)
      const data = request.only(['name', 'address', 'phone', 'isActive'])
      restaurant.merge(data)
      await restaurant.save()
      return response.ok({ data: restaurant })
    } catch (error) {
      return response.badRequest({ error: 'Failed to update restaurant' })
    }
  }

  /**
   * Delete a restaurant
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const restaurant = await Restaurant.findOrFail(params.id)
      restaurant.isActive = false
      await restaurant.save()
      return response.ok({ message: 'Restaurant deactivated successfully' })
    } catch (error) {
      return response.badRequest({ error: 'Failed to delete restaurant' })
    }
  }
}