import User from '#models/user'
import Restaurant from '#models/restaurant'
import LeadRelation from '#models/lead_relation'
import UserRestaurant from '#models/user_restaurant'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class RestaurantPolicy extends BasePolicy {
  /**
   * Check if user can view restaurant details
   */
  async view(user: User, restaurant: Restaurant): Promise<AuthorizerResponse> {
    // Admin can view all restaurants
    if (user.role === 'admin') {
      return true
    }

    // Check if user has direct access to restaurant
    if (await this.hasRestaurantAccess(user, restaurant.id)) {
      return true
    }

    // Ops Lead can view restaurants in their circle
    if (user.role === 'ops_lead') {
      return await this.canAccessRestaurantViaCircle(user, restaurant)
    }

    return false
  }

  /**
   * Check if user can create restaurants
   */
  async create(user: User): Promise<AuthorizerResponse> {
    // Only admin and ops_lead can create restaurants
    return ['admin', 'ops_lead'].includes(user.role)
  }

  /**
   * Check if user can edit restaurant details
   */
  async edit(user: User, restaurant: Restaurant): Promise<AuthorizerResponse> {
    // Admin can edit all restaurants
    if (user.role === 'admin') {
      return true
    }

    // Restaurant owner (black_shirt) can edit their restaurant
    if (user.role === 'black_shirt' && restaurant.ownerUserId === user.id) {
      return true
    }

    // Ops Lead can edit restaurants in their circle
    if (user.role === 'ops_lead') {
      return await this.canAccessRestaurantViaCircle(user, restaurant)
    }

    return false
  }

  /**
   * Check if user can delete restaurants
   */
  async delete(user: User, restaurant: Restaurant): Promise<AuthorizerResponse> {
    // Only admin can delete restaurants
    if (user.role === 'admin') {
      return true
    }

    // Ops Lead can delete restaurants in their circle (if no owner)
    if (user.role === 'ops_lead' && !restaurant.ownerUserId) {
      return await this.canAccessRestaurantViaCircle(user, restaurant)
    }

    return false
  }

  /**
   * Check if user can manage restaurant staff
   */
  async manageStaff(user: User, restaurant: Restaurant): Promise<AuthorizerResponse> {
    // Admin can manage all restaurant staff
    if (user.role === 'admin') {
      return true
    }

    // Restaurant owner can manage their restaurant staff
    if (user.role === 'black_shirt' && restaurant.ownerUserId === user.id) {
      return true
    }

    // Ops Lead can manage staff in restaurants in their circle
    if (user.role === 'ops_lead') {
      return await this.canAccessRestaurantViaCircle(user, restaurant)
    }

    return false
  }

  /**
   * Check if user can view restaurant analytics/reports
   */
  async viewAnalytics(user: User, restaurant: Restaurant): Promise<AuthorizerResponse> {
    // Admin can view all analytics
    if (user.role === 'admin') {
      return true
    }

    // Restaurant owner can view their restaurant analytics
    if (user.role === 'black_shirt' && restaurant.ownerUserId === user.id) {
      return true
    }

    // Ops Lead can view analytics for restaurants in their circle
    if (user.role === 'ops_lead') {
      return await this.canAccessRestaurantViaCircle(user, restaurant)
    }

    return false
  }

  /**
   * Helper: Check if user has direct access to restaurant
   */
  private async hasRestaurantAccess(user: User, restaurantId: number): Promise<boolean> {
    const userRestaurant = await UserRestaurant.query()
      .where('user_id', user.id)
      .where('restaurant_id', restaurantId)
      .first()

    return userRestaurant !== null
  }

  /**
   * Helper: Check if ops_lead can access restaurant via their circle
   */
  private async canAccessRestaurantViaCircle(user: User, restaurant: Restaurant): Promise<boolean> {
    if (user.role !== 'ops_lead') {
      return false
    }

    // If restaurant has no owner, ops_lead from original circle can access
    if (!restaurant.ownerUserId) {
      return true
    }

    // Check if restaurant owner is in ops_lead's circle
    const relation = await LeadRelation.query()
      .where('lead_user_id', user.id)
      .where('black_shirt_user_id', restaurant.ownerUserId)
      .first()

    return relation !== null
  }
}

