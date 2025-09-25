import User from '#models/user'
import Restaurant from '#models/restaurant'
import UserRestaurant from '#models/user_restaurant'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class PlPolicy extends BasePolicy {
  /**
   * Check if user can view Area P&L dashboard
   */
  async viewAreaPl(currentUser: User): Promise<AuthorizerResponse> {
    // Only admin and ops_lead can view Area P&L
    if (['admin', 'ops_lead'].includes(currentUser.role)) {
      return true
    }

    return false
  }

  /**
   * Check if user can view detailed P&L reports
   */
  async viewDetailedReports(currentUser: User): Promise<AuthorizerResponse> {
    // Only admin and ops_lead can view detailed P&L reports
    if (['admin', 'ops_lead'].includes(currentUser.role)) {
      return true
    }

    return false
  }

  /**
   * Check if user can export P&L data
   */
  async exportPlData(currentUser: User): Promise<AuthorizerResponse> {
    // Only admin and ops_lead can export P&L data
    if (['admin', 'ops_lead'].includes(currentUser.role)) {
      return true
    }

    return false
  }

  /**
   * Check if user can upload P&L reports
   */
  async uploadPlReports(currentUser: User, restaurantId?: number): Promise<AuthorizerResponse> {
    // Associates and tablets cannot upload P&L reports
    if (['associate', 'tablet'].includes(currentUser.role)) {
      return false
    }

    // Other authenticated users can upload P&L reports for restaurants they have access to
    if (restaurantId) {
      return await this.hasRestaurantAccess(currentUser, restaurantId)
    }

    return true
  }

  /**
   * Check if user can view P&L reports
   */
  async viewPlReports(currentUser: User, restaurantId?: number): Promise<AuthorizerResponse> {
    // Tablets cannot view P&L reports
    if (currentUser.role === 'tablet') {
      return false
    }

    // Other authenticated users can view P&L reports for restaurants they have access to
    if (restaurantId) {
      return await this.hasRestaurantAccess(currentUser, restaurantId)
    }

    return true
  }

  /**
   * Check if user can delete P&L reports
   */
  async deletePlReports(currentUser: User, restaurantId?: number): Promise<AuthorizerResponse> {
    // Admin can delete all P&L reports
    if (currentUser.role === 'admin') {
      return true
    }

    // Ops Lead can delete P&L reports for restaurants in their area
    if (currentUser.role === 'ops_lead') {
      if (restaurantId) {
        return await this.hasRestaurantAccess(currentUser, restaurantId)
      }
      return true
    }

    // Black Shirt can delete P&L reports for their own restaurants
    if (currentUser.role === 'black_shirt') {
      if (restaurantId) {
        return await this.hasRestaurantAccess(currentUser, restaurantId)
      }
      return false
    }

    // Associates and tablets cannot delete P&L reports
    if (['associate', 'tablet'].includes(currentUser.role)) {
      return false
    }

    return false
  }

  /**
   * Check if user can take P&L practice tests
   */
  async takePracticeTests(currentUser: User): Promise<AuthorizerResponse> {
    // Tablets cannot take P&L practice tests
    if (currentUser.role === 'tablet') {
      return false
    }
    // All other authenticated users can take P&L practice tests
    return true
  }

  /**
   * Check if user can view P&L test results
   */
  async viewTestResults(currentUser: User, targetUserId?: number): Promise<AuthorizerResponse> {
    // Users can always view their own test results
    if (!targetUserId || currentUser.id === targetUserId) {
      return true
    }

    // Admin can view all test results
    if (currentUser.role === 'admin') {
      return true
    }

    // Associates and tablets can only view their own test results
    if (['associate', 'tablet'].includes(currentUser.role)) {
      return false
    }

    // Ops Lead and Black Shirt can view test results for users in their restaurants
    if (['ops_lead', 'black_shirt'].includes(currentUser.role)) {
      if (targetUserId) {
        const targetUser = await User.find(targetUserId)
        if (targetUser) {
          return await this.shareRestaurant(currentUser, targetUser)
        }
      }
      return false
    }

    return false
  }

  /**
   * Check if user can manage P&L questions and test sets
   */
  async managePlQuestions(currentUser: User): Promise<AuthorizerResponse> {
    // Only admin can manage P&L questions and test sets
    if (currentUser.role === 'admin') {
      return true
    }

    return false
  }

  /**
   * Check if user can view P&L line items
   */
  async viewPlLineItems(currentUser: User, restaurantId?: number): Promise<AuthorizerResponse> {
    // Tablets cannot view P&L line items
    if (currentUser.role === 'tablet') {
      return false
    }

    // Other authenticated users can view P&L line items for restaurants they have access to
    if (restaurantId) {
      return await this.hasRestaurantAccess(currentUser, restaurantId)
    }

    return true
  }

  /**
   * Helper: Check if user has access to restaurant
   */
  private async hasRestaurantAccess(user: User, restaurantId: number): Promise<boolean> {
    if (user.role === 'admin') return true

    const userRestaurant = await UserRestaurant.query()
      .where('user_id', user.id)
      .where('restaurant_id', restaurantId)
      .first()

    return userRestaurant !== null
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
