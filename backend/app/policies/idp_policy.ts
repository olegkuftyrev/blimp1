import User from '#models/user'
import UserRestaurant from '#models/user_restaurant'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class IdpPolicy extends BasePolicy {
  /**
   * Check if user can view their own IDP assessment
   */
  async viewOwnAssessment(user: User): Promise<AuthorizerResponse> {
    // Tablets cannot access IDP assessments
    if (user.role === 'tablet') {
      return false
    }
    // All other authenticated users can view their own IDP assessment
    return true
  }

  /**
   * Check if user can view another user's IDP assessment
   */
  async viewUserAssessment(currentUser: User, targetUser: User): Promise<AuthorizerResponse> {
    // Users can always view their own assessment
    if (currentUser.id === targetUser.id) {
      return true
    }

    // Admin can view all assessments
    if (currentUser.role === 'admin') {
      return true
    }

    // Associates cannot view other users' assessments
    if (currentUser.role === 'associate') {
      return false
    }

    // Tablets cannot view other users' assessments
    if (currentUser.role === 'tablet') {
      return false
    }

    // Ops Lead and Black Shirt can view assessments of users in their restaurants
    if (['ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return await this.shareRestaurant(currentUser, targetUser)
    }

    return false
  }

  /**
   * Check if user can save answers to their own IDP assessment
   */
  async saveOwnAnswers(user: User): Promise<AuthorizerResponse> {
    // Tablets cannot save IDP assessment answers
    if (user.role === 'tablet') {
      return false
    }
    // All other authenticated users can save their own assessment answers
    return true
  }

  /**
   * Check if user can save answers for another user's IDP assessment
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
   * Check if user can complete their own IDP assessment
   */
  async completeOwnAssessment(user: User): Promise<AuthorizerResponse> {
    // Tablets cannot complete IDP assessments
    if (user.role === 'tablet') {
      return false
    }
    // All other authenticated users can complete their own assessment
    return true
  }

  /**
   * Check if user can complete another user's IDP assessment
   */
  async completeUserAssessment(currentUser: User, targetUser: User): Promise<AuthorizerResponse> {
    // Users can always complete their own assessment
    if (currentUser.id === targetUser.id) {
      return true
    }

    // Admin can complete assessments for any user
    if (currentUser.role === 'admin') {
      return true
    }

    // Associates and tablets can only complete their own assessment
    if (['associate', 'tablet'].includes(currentUser.role)) {
      return false
    }

    // Ops Lead and Black Shirt can complete assessments for users in their restaurants
    if (['ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return await this.shareRestaurant(currentUser, targetUser)
    }

    return false
  }

  /**
   * Check if user can reset their own IDP assessment
   */
  async resetOwnAssessment(user: User): Promise<AuthorizerResponse> {
    // Tablets cannot reset IDP assessments
    if (user.role === 'tablet') {
      return false
    }
    // All other authenticated users can reset their own assessment
    return true
  }

  /**
   * Check if user can reset another user's IDP assessment
   */
  async resetUserAssessment(currentUser: User, targetUser: User): Promise<AuthorizerResponse> {
    // Users can always reset their own assessment
    if (currentUser.id === targetUser.id) {
      return true
    }

    // Admin can reset assessments for any user
    if (currentUser.role === 'admin') {
      return true
    }

    // Associates and tablets can only reset their own assessment
    if (['associate', 'tablet'].includes(currentUser.role)) {
      return false
    }

    // Ops Lead and Black Shirt can reset assessments for users in their restaurants
    if (['ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return await this.shareRestaurant(currentUser, targetUser)
    }

    return false
  }

  /**
   * Check if user can view IDP roles and competencies
   */
  async viewRolesAndCompetencies(user: User): Promise<AuthorizerResponse> {
    // Tablets cannot view IDP roles and competencies
    if (user.role === 'tablet') {
      return false
    }
    // All other authenticated users can view IDP roles and competencies
    return true
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
