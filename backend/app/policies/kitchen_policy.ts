import User from '#models/user'
import Order from '#models/order'
import UserRestaurant from '#models/user_restaurant'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class KitchenPolicy extends BasePolicy {
  /**
   * Check if user can view kitchen operations for a restaurant
   */
  async viewKitchen(user: User, restaurantId: number): Promise<AuthorizerResponse> {
    // Admin can view all kitchens
    if (user.role === 'admin') {
      return true
    }

    // Kitchen staff (ops_lead, black_shirt) can view kitchen in their restaurants
    if (['ops_lead', 'black_shirt'].includes(user.role)) {
      return await this.hasRestaurantAccess(user, restaurantId)
    }

    // Associates can view kitchen in their restaurants (read-only)
    if (user.role === 'associate') {
      return await this.hasRestaurantAccess(user, restaurantId)
    }

    return false
  }

  /**
   * Check if user can manage kitchen timers
   */
  async manageTimers(user: User, order: Order): Promise<AuthorizerResponse> {
    // Admin can manage all timers
    if (user.role === 'admin') {
      return true
    }

    // Only kitchen management (ops_lead, black_shirt) can manage timers
    if (['ops_lead', 'black_shirt'].includes(user.role)) {
      return await this.hasRestaurantAccess(user, order.restaurantId)
    }

    return false
  }

  /**
   * Check if user can start cooking timers
   */
  async startTimer(user: User, order: Order): Promise<AuthorizerResponse> {
    return await this.manageTimers(user, order)
  }

  /**
   * Check if user can complete orders
   */
  async completeOrder(user: User, order: Order): Promise<AuthorizerResponse> {
    // Admin can complete all orders
    if (user.role === 'admin') {
      return true
    }

    // Kitchen staff can complete orders in their restaurants
    if (['ops_lead', 'black_shirt'].includes(user.role)) {
      return await this.hasRestaurantAccess(user, order.restaurantId)
    }

    return false
  }

  /**
   * Check if user can view kitchen statistics/reports
   */
  async viewKitchenStats(user: User, restaurantId: number): Promise<AuthorizerResponse> {
    // Admin can view all stats
    if (user.role === 'admin') {
      return true
    }

    // Ops Lead can view stats for their restaurants
    if (user.role === 'ops_lead') {
      return await this.hasRestaurantAccess(user, restaurantId)
    }

    return false
  }

  /**
   * Check if user can modify kitchen settings
   */
  async modifyKitchenSettings(user: User, restaurantId: number): Promise<AuthorizerResponse> {
    // Admin can modify all settings
    if (user.role === 'admin') {
      return true
    }

    // Only Ops Lead can modify kitchen settings
    if (user.role === 'ops_lead') {
      return await this.hasRestaurantAccess(user, restaurantId)
    }

    return false
  }

  /**
   * Check if user can access kitchen history
   */
  async viewHistory(user: User, restaurantId: number): Promise<AuthorizerResponse> {
    // Admin can view all history
    if (user.role === 'admin') {
      return true
    }

    // Kitchen staff can view history in their restaurants
    if (['ops_lead', 'black_shirt'].includes(user.role)) {
      return await this.hasRestaurantAccess(user, restaurantId)
    }

    return false
  }

  /**
   * Helper method to check restaurant access
   */
  private async hasRestaurantAccess(user: User, restaurantId: number): Promise<boolean> {
    if (user.role === 'admin') return true

    const userRestaurant = await UserRestaurant.query()
      .where('user_id', user.id)
      .where('restaurant_id', restaurantId)
      .first()

    return userRestaurant !== null
  }
}