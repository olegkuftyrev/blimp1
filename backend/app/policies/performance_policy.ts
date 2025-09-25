import User from '#models/user'
import UserRestaurant from '#models/user_restaurant'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class PerformancePolicy extends BasePolicy {
  /**
   * Check if user can view performance roles and sections
   */
  async viewRoles(currentUser: User): Promise<AuthorizerResponse> {
    // Tablets cannot view performance roles
    if (currentUser.role === 'tablet') {
      return false
    }
    // All other authenticated users can view performance roles
    return true
  }

  /**
   * Check if user can view specific role performance details
   */
  async viewRoleDetails(currentUser: User): Promise<AuthorizerResponse> {
    // Tablets cannot view role performance details
    if (currentUser.role === 'tablet') {
      return false
    }
    // All other authenticated users can view role performance details
    return true
  }

  /**
   * Check if user can save their own performance answers
   */
  async saveOwnAnswers(currentUser: User): Promise<AuthorizerResponse> {
    // Tablets cannot save performance answers
    if (currentUser.role === 'tablet') {
      return false
    }
    // All other authenticated users can save their own performance answers
    return true
  }

  /**
   * Check if user can save performance answers for another user
   */
  async saveUserAnswers(currentUser: User, targetUser: User): Promise<AuthorizerResponse> {
    // Users can always save their own answers
    if (currentUser.id === targetUser.id) {
      return true
    }

    // Admin can save answers for any user
    if (currentUser.role === 'admin') {
      return true
    }

    // Associates and tablets can only save their own answers
    if (['associate', 'tablet'].includes(currentUser.role)) {
      return false
    }

    // Ops Lead and Black Shirt can save answers for users in their restaurants
    if (['ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return await this.shareRestaurant(currentUser, targetUser)
    }

    return false
  }

  /**
   * Check if user can view their own performance data
   */
  async viewOwnPerformance(currentUser: User): Promise<AuthorizerResponse> {
    // Tablets cannot view performance data
    if (currentUser.role === 'tablet') {
      return false
    }
    // All other authenticated users can view their own performance data
    return true
  }

  /**
   * Check if user can view another user's performance data
   */
  async viewUserPerformance(currentUser: User, targetUser: User): Promise<AuthorizerResponse> {
    // Users can always view their own performance
    if (currentUser.id === targetUser.id) {
      return true
    }

    // Admin can view all performance data
    if (currentUser.role === 'admin') {
      return true
    }

    // Associates and tablets can only view their own performance
    if (['associate', 'tablet'].includes(currentUser.role)) {
      return false
    }

    // Ops Lead and Black Shirt can view performance of users in their restaurants
    if (['ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return await this.shareRestaurant(currentUser, targetUser)
    }

    return false
  }

  /**
   * Check if user can view team performance analytics
   */
  async viewTeamAnalytics(currentUser: User): Promise<AuthorizerResponse> {
    // Admin can view all team analytics
    if (currentUser.role === 'admin') {
      return true
    }

    // Ops Lead and Black Shirt can view team analytics for their restaurants
    if (['ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return true
    }

    // Associates and tablets cannot view team analytics
    if (['associate', 'tablet'].includes(currentUser.role)) {
      return false
    }

    return false
  }

  /**
   * Check if user can export performance data
   */
  async exportPerformanceData(currentUser: User): Promise<AuthorizerResponse> {
    // Admin can export all performance data
    if (currentUser.role === 'admin') {
      return true
    }

    // Ops Lead and Black Shirt can export performance data for their restaurants
    if (['ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return true
    }

    // Associates and tablets cannot export performance data
    if (['associate', 'tablet'].includes(currentUser.role)) {
      return false
    }

    return false
  }

  /**
   * Check if user can manage performance settings
   */
  async manageSettings(currentUser: User): Promise<AuthorizerResponse> {
    // Only admin can manage performance settings
    if (currentUser.role === 'admin') {
      return true
    }

    return false
  }

  /**
   * Helper: Check if users share at least one restaurant
   */
  private async shareRestaurant(user1: User, user2: User): Promise<boolean> {
    const user1RestaurantRecords = await UserRestaurant.query()
      .where('user_id', user1.id)
      .select('restaurant_id')
    const user1Restaurants = user1RestaurantRecords.map(ur => ur.restaurantId)

    const user2RestaurantRecords = await UserRestaurant.query()
      .where('user_id', user2.id)
      .select('restaurant_id')
    const user2Restaurants = user2RestaurantRecords.map(ur => ur.restaurantId)

    return user1Restaurants.some((id: number) => user2Restaurants.includes(id))
  }
}
