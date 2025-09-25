import User from '#models/user'
import Order from '#models/order'
import UserRestaurant from '#models/user_restaurant'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class OrderPolicy extends BasePolicy {
  /**
   * Check if user can view orders in a restaurant
   */
  async view(user: User, restaurantId: number): Promise<AuthorizerResponse> {
    // All authenticated users can view orders in restaurants they have access to
    return await this.hasRestaurantAccess(user, restaurantId)
  }

  /**
   * Check if user can create orders in a restaurant
   */
  async create(user: User, restaurantId: number): Promise<AuthorizerResponse> {
    // All authenticated users (including tablets) can create orders in restaurants they have access to
    return await this.hasRestaurantAccess(user, restaurantId)
  }

  /**
   * Check if user can edit/update an order
   */
  async edit(user: User, order: Order): Promise<AuthorizerResponse> {
    // Admin can edit all orders
    if (user.role === 'admin') {
      return true
    }

    // Ops Lead and Black Shirt can edit orders in their restaurants
    if (['ops_lead', 'black_shirt'].includes(user.role)) {
      return await this.hasRestaurantAccess(user, order.restaurantId)
    }

    // Associates can only edit orders they created (if we track creator)
    return false
  }

  /**
   * Check if user can delete an order
   */
  async delete(user: User, order: Order): Promise<AuthorizerResponse> {
    // Admin can delete all orders
    if (user.role === 'admin') {
      return true
    }

    // Ops Lead can delete orders in their restaurants
    if (user.role === 'ops_lead') {
      return await this.hasRestaurantAccess(user, order.restaurantId)
    }

    // Black Shirt can delete orders in their restaurants
    if (user.role === 'black_shirt') {
      return await this.hasRestaurantAccess(user, order.restaurantId)
    }

    return false
  }

  /**
   * Check if user can manage timers for orders
   */
  async manageTimer(user: User, order: Order): Promise<AuthorizerResponse> {
    // Admin can manage all timers
    if (user.role === 'admin') {
      return true
    }

    // Only kitchen staff (ops_lead, black_shirt) can manage timers
    if (['ops_lead', 'black_shirt'].includes(user.role)) {
      return await this.hasRestaurantAccess(user, order.restaurantId)
    }

    return false
  }

  /**
   * Check if user can complete orders
   */
  async complete(user: User, order: Order): Promise<AuthorizerResponse> {
    // Same as timer management - kitchen staff only
    return await this.manageTimer(user, order)
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




