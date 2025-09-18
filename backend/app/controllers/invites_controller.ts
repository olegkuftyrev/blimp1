import type { HttpContext } from '@adonisjs/core/http'
import Invitation from '#models/invitation'
import Restaurant from '#models/restaurant'
import LeadRelation from '#models/lead_relation'
import AuditService from '#services/audit_service'
import { randomUUID } from 'node:crypto'
import { manageUsersInRestaurant } from '#abilities/main'

const JOB_TITLES = ['Hourly Associate', 'AM', 'Chef', 'SM/GM/TL', 'ACO', 'RDO'] as const

type JobTitle = typeof JOB_TITLES[number]

export default class InvitesController {
  async create({ request, auth, response, bouncer }: HttpContext) {
    await auth.authenticate()
    const user = auth.user!

    const role = request.input('role') as 'black_shirt' | 'associate'
    const restaurantId = request.input('restaurant_id') as number | undefined
    const jobTitle = request.input('job_title') as JobTitle | undefined

    if (!role || !['black_shirt', 'associate'].includes(role)) {
      return response.badRequest({ error: 'role must be black_shirt or associate' })
    }

    if (jobTitle && !JOB_TITLES.includes(jobTitle)) {
      return response.badRequest({ error: 'Invalid job_title' })
    }

    if (role === 'black_shirt') {
      if (user.role !== 'ops_lead' && user.role !== 'admin') {
        return response.forbidden({ error: 'Only ops_lead or admin can invite black_shirt' })
      }
    } else if (role === 'associate') {
      if (!restaurantId) {
        return response.badRequest({ error: 'restaurant_id is required for associate invite' })
      }

      const restaurant = await Restaurant.find(restaurantId)
      if (!restaurant) return response.notFound({ error: 'Restaurant not found' })

      // Authorize via Bouncer (circle/ownership rules)
      if (user.role !== 'admin') {
        const ok = await bouncer.allows(manageUsersInRestaurant, restaurant, 'associate')
        if (!ok) {
          return response.forbidden({ error: 'Not allowed to invite associate for this restaurant' })
        }
      }

      // keep legacy checks for clarity (can be removed later)
      if (user.role === 'black_shirt') {
        if (restaurant.ownerUserId !== user.id) {
          return response.forbidden({ error: 'black_shirt can invite associates only to own restaurant' })
        }
      } else if (user.role === 'ops_lead') {
        if (!restaurant.ownerUserId) {
          // orphan restaurant is considered manageable by ops_lead
        } else {
          const relation = await LeadRelation.query()
            .where('lead_user_id', user.id)
            .andWhere('black_shirt_user_id', restaurant.ownerUserId)
            .first()
          if (!relation) {
            return response.forbidden({ error: 'Restaurant not in ops_lead circle' })
          }
        }
      }
    }

    const code = randomUUID()
    const invite = await Invitation.create({
      code,
      role,
      createdByUserId: user.id,
      restaurantId: restaurantId ?? null,
      jobTitle: jobTitle ?? null,
    })

    await AuditService.log({
      actorUserId: user.id,
      action: 'invite_create',
      entityType: 'invite',
      entityId: invite.id,
      payload: { role, restaurantId: restaurantId ?? null, jobTitle: jobTitle ?? null },
    })

    return response.created({ code: invite.code, role: invite.role, restaurant_id: invite.restaurantId, job_title: invite.jobTitle })
  }
}
