import User from '#models/user'
import Invitation from '#models/invitation'
import UserRestaurant from '#models/user_restaurant'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { DateTime } from 'luxon'

export default class InvitePolicy extends BasePolicy {
  /**
   * Check if user can create invitations
   */
  async create(user: User, role: string, restaurantId?: number): Promise<AuthorizerResponse> {
    // Admin can create any invitations
    if (user.role === 'admin') {
      return true
    }

    // Ops Lead can invite black_shirt, associate, and tablet to their restaurants
    if (user.role === 'ops_lead') {
      if (!['black_shirt', 'associate', 'tablet'].includes(role)) {
        return false
      }

      if (restaurantId) {
        return await this.hasRestaurantAccess(user, restaurantId)
      }

      return true // Can create invites without specific restaurant
    }

    // Black Shirt can invite black_shirt, associates and tablets to their restaurants
    if (user.role === 'black_shirt' && ['black_shirt', 'associate', 'tablet'].includes(role)) {
      if (restaurantId) {
        return await this.hasRestaurantAccess(user, restaurantId)
      }

      return true
    }

    return false
  }

  /**
   * Check if user can view invitations
   */
  async view(user: User, invitation: Invitation): Promise<AuthorizerResponse> {
    // Admin can view all invitations
    if (user.role === 'admin') {
      return true
    }

    // Users can view invitations they created
    if (invitation.createdByUserId === user.id) {
      return true
    }

    // Ops Lead can view invitations for their restaurants
    if (user.role === 'ops_lead' && invitation.restaurantId) {
      return await this.hasRestaurantAccess(user, invitation.restaurantId)
    }

    return false
  }

  /**
   * Check if user can use/accept an invitation
   */
  async use(invitation: Invitation, email: string): Promise<AuthorizerResponse> {
    // Invitation must not be used
    if (invitation.usedAt) {
      return false
    }

    // Email must match if specified
    if (invitation.email && invitation.email !== email) {
      return false
    }

    // Invitation must not be expired
    if (invitation.expiresAt && invitation.expiresAt < DateTime.now()) {
      return false
    }

    return true
  }

  /**
   * Check if user can delete/revoke invitations
   */
  async delete(user: User, invitation: Invitation): Promise<AuthorizerResponse> {
    // Admin can delete all invitations
    if (user.role === 'admin') {
      return true
    }

    // Users can delete invitations they created
    if (invitation.createdByUserId === user.id) {
      return true
    }

    // Ops Lead can delete invitations for their restaurants
    if (user.role === 'ops_lead' && invitation.restaurantId) {
      return await this.hasRestaurantAccess(user, invitation.restaurantId)
    }

    return false
  }

  /**
   * Check if user can resend invitations
   */
  async resend(user: User, invitation: Invitation): Promise<AuthorizerResponse> {
    // Same rules as delete - if you can manage it, you can resend it
    return await this.delete(user, invitation)
  }

  /**
   * Check role hierarchy for invitations
   */
  async canInviteRole(user: User, targetRole: string): Promise<AuthorizerResponse> {
    const roleHierarchy = {
      'admin': ['admin', 'ops_lead', 'black_shirt', 'associate', 'tablet'],
      'ops_lead': ['black_shirt', 'associate', 'tablet'],
      'black_shirt': ['associate', 'tablet'],
      'tablet': [], // Tablets cannot invite anyone
      'associate': [] // Associates cannot invite anyone
    }

    const allowedRoles = roleHierarchy[user.role as keyof typeof roleHierarchy] || []
    return allowedRoles.includes(targetRole)
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




