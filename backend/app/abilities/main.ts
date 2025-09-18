/*
|--------------------------------------------------------------------------
| Bouncer abilities
|--------------------------------------------------------------------------
|
| You may export multiple abilities from this file and pre-register them
| when creating the Bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

import { Bouncer } from '@adonisjs/bouncer'
import User from '#models/user'
import Restaurant from '#models/restaurant'
import LeadRelation from '#models/lead_relation'

export const manageRestaurants = Bouncer.ability(async (user: User, restaurant: Restaurant) => {
  if (user.role === 'admin') return true
  if (user.role === 'black_shirt') return restaurant.ownerUserId === user.id
  if (user.role === 'ops_lead') {
    if (!restaurant.ownerUserId) return true
    const rel = await LeadRelation.query()
      .where('lead_user_id', user.id)
      .andWhere('black_shirt_user_id', restaurant.ownerUserId)
      .first()
    return !!rel
  }
  return false
})

export const manageUsersInRestaurant = Bouncer.ability(
  async (user: User, restaurant: Restaurant, targetRole: User['role']) => {
    if (user.role === 'admin') return true
    if (user.role === 'black_shirt') {
      if (restaurant.ownerUserId !== user.id) return false
      return targetRole === 'associate'
    }
    if (user.role === 'ops_lead') {
      if (!restaurant.ownerUserId) return true
      const rel = await LeadRelation.query()
        .where('lead_user_id', user.id)
        .andWhere('black_shirt_user_id', restaurant.ownerUserId)
        .first()
      return !!rel
    }
    return false
  }
)