import User from '#models/user'
import LeadRelation from '#models/lead_relation'
import UserRestaurant from '#models/user_restaurant'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  /**
   * Check if user can view another user's profile
   */
  async viewProfile(currentUser: User, targetUser: User): Promise<AuthorizerResponse> {
    // Users can always view their own profile
    if (currentUser.id === targetUser.id) {
      return true
    }

    // Admin can view all profiles
    if (currentUser.role === 'admin') {
      return true
    }

    // Ops Lead can view profiles of users in their restaurants
    if (currentUser.role === 'ops_lead') {
      return await this.shareRestaurant(currentUser, targetUser)
    }

    // Black Shirt can view their direct reports
    if (currentUser.role === 'black_shirt') {
      const relation = await LeadRelation.query()
        .where('lead_user_id', currentUser.id)
        .where('black_shirt_user_id', targetUser.id)
        .first()
      
      return relation !== null
    }

    // Associates and tablets can only view their own profile
    if (['associate', 'tablet'].includes(currentUser.role)) {
      return false
    }

    return false
  }

  /**
   * Check if user can edit another user's profile
   */
  async editProfile(currentUser: User, targetUser: User): Promise<AuthorizerResponse> {
    // Users can always edit their own profile
    if (currentUser.id === targetUser.id) {
      return true
    }

    // Admin can edit all profiles
    if (currentUser.role === 'admin') {
      return true
    }

    // Ops Lead can ONLY edit black_shirt and associate profiles (NOT other ops_lead or admin)
    if (currentUser.role === 'ops_lead' && ['black_shirt', 'associate'].includes(targetUser.role)) {
      return await this.shareRestaurant(currentUser, targetUser)
    }

    // Black Shirt can only edit associate profiles in their restaurants
    if (currentUser.role === 'black_shirt' && targetUser.role === 'associate') {
      return await this.shareRestaurant(currentUser, targetUser)
    }

    // Associates and tablets cannot edit other user profiles

    return false
  }


  /**
   * Check if user can manage other users (assign to restaurants, etc.)
   */
  async manageUser(currentUser: User, targetUser: User): Promise<AuthorizerResponse> {
    // Admin can manage all users
    if (currentUser.role === 'admin') {
      return true
    }

    // Ops Lead can ONLY manage black_shirt and associate (NOT other ops_lead or admin)
    if (currentUser.role === 'ops_lead' && ['black_shirt', 'associate'].includes(targetUser.role)) {
      return true
    }

    // Black Shirt can ONLY manage associates in their restaurants (NOT other black_shirt)
    if (currentUser.role === 'black_shirt' && targetUser.role === 'associate') {
      return await this.shareRestaurant(currentUser, targetUser)
    }

    // Associates and tablets cannot manage other users

    return false
  }

  /**
   * Check if user can delete/deactivate another user
   */
  async deleteUser(currentUser: User, targetUser: User): Promise<AuthorizerResponse> {
    // Only admin can delete users
    if (currentUser.role === 'admin') {
      return true
    }

    // Ops Lead can ONLY delete black_shirt and associate (NOT other ops_lead or admin)
    if (currentUser.role === 'ops_lead' && ['black_shirt', 'associate'].includes(targetUser.role)) {
      return await this.shareRestaurant(currentUser, targetUser)
    }

    // Black Shirt can ONLY delete associates in their restaurants (NOT other black_shirt)
    if (currentUser.role === 'black_shirt' && targetUser.role === 'associate') {
      return await this.shareRestaurant(currentUser, targetUser)
    }

    return false
  }

  /**
   * Check if user can view the list of all users
   */
  async viewUsersList(_user: User): Promise<AuthorizerResponse> {
    // All authenticated users can view the staff list
    // Specific actions (create, edit, delete) will have their own restrictions
    return true
  }

  /**
   * Check if user can create new users
   */
  async createUser(user: User, targetRole?: string): Promise<AuthorizerResponse> {
    // Admin can create any users
    if (user.role === 'admin') {
      return true
    }

    // Ops Lead can create black_shirt and associate users (NOT other ops_lead or admin)
    if (user.role === 'ops_lead' && targetRole) {
      return ['black_shirt', 'associate'].includes(targetRole)
    }

    // Black Shirt can create black_shirt and associate users (NOT ops_lead or admin)
    if (user.role === 'black_shirt' && targetRole) {
      return ['black_shirt', 'associate'].includes(targetRole)
    }

    // Associates and tablets cannot create other users

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




