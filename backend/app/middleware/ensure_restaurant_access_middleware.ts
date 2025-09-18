import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Restaurant from '#models/restaurant'
import UserRestaurant from '#models/user_restaurant'
import LeadRelation from '#models/lead_relation'

export default class EnsureRestaurantAccessMiddleware {
  /**
   * Ensure the authenticated user can access a given restaurant.
   * The restaurant id is read from route param name (default: 'restaurant_id').
   */
  async handle(ctx: HttpContext, next: NextFn, params: string[] = []) {
    await ctx.auth.authenticate()
    const user = ctx.auth.user!
    const paramName = params[0] || 'restaurant_id'
    const idRaw = ctx.request.param(paramName) ?? ctx.request.input(paramName)
    const restaurantId = Number(idRaw)

    if (!restaurantId || Number.isNaN(restaurantId)) {
      return ctx.response.badRequest({ error: `Missing or invalid ${paramName}` })
    }

    if (user.role === 'admin') {
      return next()
    }

    const restaurant = await Restaurant.find(restaurantId)
    if (!restaurant) {
      return ctx.response.notFound({ error: 'Restaurant not found' })
    }

    // direct membership (owners and associates/black_shirts via user_restaurants)
    const membership = await UserRestaurant.query()
      .where('user_id', user.id)
      .andWhere('restaurant_id', restaurantId)
      .first()

    if (membership) {
      return next()
    }

    // ops_lead circle: access if restaurant owner is a black_shirt in his circle
    if (user.role === 'ops_lead') {
      if (restaurant.ownerUserId) {
        const relation = await LeadRelation.query()
          .where('lead_user_id', user.id)
          .andWhere('black_shirt_user_id', restaurant.ownerUserId)
          .first()
        if (relation) {
          return next()
        }
      } else {
        // Orphan restaurant: temporarily managed by admin + the same ops_lead (we allow any ops_lead from original circle; original unknown → allow ops_lead)
        return next()
      }
    }

    return ctx.response.forbidden({ error: 'No access to this restaurant' })
  }
}
