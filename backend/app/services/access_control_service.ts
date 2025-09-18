import User from '#models/user'
import Restaurant from '#models/restaurant'
import LeadRelation from '#models/lead_relation'
import UserRestaurant from '#models/user_restaurant'

export default class AccessControlService {
  static async canManageRestaurants(actor: User, restaurant: Restaurant): Promise<boolean> {
    if (actor.role === 'admin') return true
    if (actor.role === 'black_shirt') return restaurant.ownerUserId === actor.id
    if (actor.role === 'ops_lead') {
      if (!restaurant.ownerUserId) return true
      const rel = await LeadRelation.query()
        .where('lead_user_id', actor.id)
        .andWhere('black_shirt_user_id', restaurant.ownerUserId)
        .first()
      return !!rel
    }
    return false
  }

  static async canManageUsersInRestaurant(actor: User, restaurant: Restaurant, targetRole: User['role']): Promise<boolean> {
    if (actor.role === 'admin') return true

    if (actor.role === 'black_shirt') {
      if (restaurant.ownerUserId !== actor.id) return false
      // black_shirt can manage associates only
      return targetRole === 'associate'
    }

    if (actor.role === 'ops_lead') {
      if (!restaurant.ownerUserId) return true
      const rel = await LeadRelation.query()
        .where('lead_user_id', actor.id)
        .andWhere('black_shirt_user_id', restaurant.ownerUserId)
        .first()
      return !!rel
    }

    return false
  }

  static async isMemberOfRestaurant(user: User, restaurantId: number): Promise<boolean> {
    if (user.role === 'admin') return true
    const membership = await UserRestaurant.query().where('user_id', user.id).andWhere('restaurant_id', restaurantId).first()
    return !!membership
  }
}
