import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import { withSimpleAuth, AuthenticatedContext } from '#utils/simple_auth_helper'
import { inject } from '@adonisjs/core'
import { Bouncer } from '@adonisjs/bouncer'
import { DateTime } from 'luxon'
import TimerService from '#services/timer_service'

@inject()
export default class SimpleOrdersController {
  constructor(private bouncer: Bouncer) {}

  /**
   * Get orders for a restaurant
   */
  async index({ request, response }: HttpContext) {
    return withSimpleAuth({ request, response } as HttpContext, async (ctx: AuthenticatedContext) => {
      try {
        const user = ctx.authenticatedUser
        const restaurantId = request.qs().restaurant_id

        if (!restaurantId) {
          return response.status(400).json({ error: 'restaurant_id is required' })
        }

        // Check if user can view orders for this restaurant
        const canView = await this.bouncer.forUser(user).allows('OrderPolicy.view', parseInt(restaurantId))
        if (!canView) {
          return response.status(403).json({ error: 'Access denied to orders for this restaurant' })
        }

        const orders = await Order.query()
          .where('restaurantId', restaurantId)
          .preload('menuItem')
          .orderBy('createdAt', 'desc')

        console.log(`User ${user.email} (${user.role}) accessing ${orders.length} orders for restaurant ${restaurantId}`)

        return response.ok({ data: orders })
      } catch (error: any) {
        if (error.message.includes('Bearer token') || error.message.includes('Invalid token')) {
          return // Response already sent
        }
        console.error('Error fetching orders:', error)
        return response.status(500).json({ error: 'Failed to fetch orders' })
      }
    })
  }

  /**
   * Create a new order
   */
  async store({ request, response }: HttpContext) {
    return withSimpleAuth({ request, response } as HttpContext, async (ctx: AuthenticatedContext) => {
      try {
        const user = ctx.authenticatedUser
        const { tableSection, menuItemId, batchSize, batchNumber, restaurantId } = request.all()

        if (!tableSection || !menuItemId || !batchSize || !restaurantId) {
          return response.status(400).json({ 
            error: 'tableSection, menuItemId, batchSize, and restaurantId are required' 
          })
        }

        // Check if user can create orders for this restaurant
        const canCreate = await this.bouncer.forUser(user).allows('OrderPolicy.create', parseInt(restaurantId))
        if (!canCreate) {
          return response.status(403).json({ error: 'You are not authorized to create orders for this restaurant' })
        }

        const order = await Order.create({
          tableSection,
          menuItemId,
          batchSize,
          batchNumber: batchNumber || 1,
          restaurantId,
          status: 'pending'
        })

        await order.load('menuItem')

        console.log(`Order ${order.id} created by ${user.email} (${user.role}) for restaurant ${restaurantId}`)

        return response.created({ data: order })
      } catch (error: any) {
        if (error.message.includes('Bearer token') || error.message.includes('Invalid token')) {
          return // Response already sent
        }
        console.error('Error creating order:', error)
        return response.status(500).json({ error: 'Failed to create order' })
      }
    })
  }

  /**
   * Delete an order
   */
  async destroy({ params, response }: HttpContext) {
    return withSimpleAuth({ params, response } as HttpContext, async (ctx: AuthenticatedContext) => {
      try {
        const user = ctx.authenticatedUser
        const order = await Order.findOrFail(params.id)

        // Check if user can delete this order
        const canDelete = await this.bouncer.forUser(user).allows('OrderPolicy.delete', order)
        if (!canDelete) {
          return response.status(403).json({ error: 'You are not authorized to delete this order' })
        }

        await order.delete()

        console.log(`Order ${order.id} deleted by ${user.email} (${user.role})`)

        return response.ok({ message: 'Order deleted successfully' })
      } catch (error: any) {
        if (error.message.includes('Bearer token') || error.message.includes('Invalid token')) {
          return // Response already sent
        }
        console.error('Error deleting order:', error)
        return response.status(500).json({ error: 'Failed to delete order' })
      }
    })
  }

  /**
   * Start cooking timer for an order
   */
  async startTimer({ params, request, response }: HttpContext) {
    return withSimpleAuth({ params, request, response } as HttpContext, async (ctx: AuthenticatedContext) => {
      try {
        const user = ctx.authenticatedUser
        const order = await Order.findOrFail(params.id)

        // Check if user can manage timers for this order
        const canManageTimer = await this.bouncer.forUser(user).allows('KitchenPolicy.startTimer', order)
        if (!canManageTimer) {
          return response.status(403).json({ error: 'You are not authorized to manage timers for this order' })
        }

        if (order.status !== 'pending') {
          return response.status(400).json({
            error: 'Order is not in pending status',
            message: 'Only pending orders can start cooking timer'
          })
        }

        const { cookingTime } = request.only(['cookingTime'])
        const now = DateTime.now()
        const timerEnd = now.plus({ minutes: cookingTime })

        // Update order with timer info
        order.status = 'cooking'
        order.timerStart = now
        order.timerEnd = timerEnd
        await order.save()
        await order.load('menuItem')

        // Start the timer service
        const timerService = new TimerService()
        await timerService.startTimer(order.id, cookingTime)

        console.log(`Timer started for order ${order.id} by ${user.email} (${user.role}) - ${cookingTime} minutes`)

        return response.ok({ data: order })
      } catch (error: any) {
        if (error.message.includes('Bearer token') || error.message.includes('Invalid token')) {
          return // Response already sent
        }
        console.error('Error starting timer:', error)
        return response.status(500).json({ error: 'Failed to start timer' })
      }
    })
  }

  /**
   * Complete an order
   */
  async complete({ params, response }: HttpContext) {
    return withSimpleAuth({ params, response } as HttpContext, async (ctx: AuthenticatedContext) => {
      try {
        const user = ctx.authenticatedUser
        const order = await Order.findOrFail(params.id)

        // Check if user can complete this order
        const canComplete = await this.bouncer.forUser(user).allows('KitchenPolicy.completeOrder', order)
        if (!canComplete) {
          return response.status(403).json({ error: 'You are not authorized to complete this order' })
        }

        // Update order status
        order.status = 'ready'
        order.completedAt = DateTime.now()
        await order.save()
        await order.load('menuItem')

        // Clear timer if it exists
        const timerService = new TimerService()
        timerService.clearTimer(order.id)

        console.log(`Order ${order.id} completed by ${user.email} (${user.role})`)

        return response.ok({ data: order })
      } catch (error: any) {
        if (error.message.includes('Bearer token') || error.message.includes('Invalid token')) {
          return // Response already sent
        }
        console.error('Error completing order:', error)
        return response.status(500).json({ error: 'Failed to complete order' })
      }
    })
  }
}




