import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import { DateTime } from 'luxon'

export default class KitchenController {
  /**
   * Get all kitchen orders
   */
  async orders({ response }: HttpContext) {
    try {
      const orders = await Order.query()
        .preload('menuItem')
        .orderBy('created_at', 'desc')
      
      return response.json({
        data: orders
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to fetch kitchen orders',
        message: error.message
      })
    }
  }

  /**
   * Get pending orders
   */
  async pendingOrders({ response }: HttpContext) {
    try {
      const orders = await Order.query()
        .where('status', 'pending')
        .preload('menuItem')
        .orderBy('created_at', 'asc')
      
      return response.json({
        data: orders
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to fetch pending orders',
        message: error.message
      })
    }
  }

  /**
   * Get cooking orders
   */
  async cookingOrders({ response }: HttpContext) {
    try {
      const orders = await Order.query()
        .whereIn('status', ['cooking', 'timer_expired'])
        .preload('menuItem')
        .orderBy('timer_start', 'asc')
      
      return response.json({
        data: orders
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to fetch cooking orders',
        message: error.message
      })
    }
  }

  /**
   * Start cooking timer
   */
  async startTimer({ params, request, response }: HttpContext) {
    try {
      const order = await Order.findOrFail(params.id)
      
      if (order.status !== 'pending') {
        return response.status(400).json({
          error: 'Order is not in pending status',
          message: 'Only pending orders can start cooking timer'
        })
      }

      const { cookingTime } = request.only(['cookingTime'])
      const now = DateTime.now()
      const timerEnd = now.plus({ minutes: cookingTime })

      order.status = 'cooking'
      order.timerStart = now
      order.timerEnd = timerEnd
      
      await order.save()
      await order.load('menuItem')

      return response.json({
        data: {
          id: order.id,
          status: order.status,
          timerStart: order.timerStart,
          timerEnd: order.timerEnd,
          updatedAt: order.updatedAt
        }
      })
    } catch (error) {
      return response.status(400).json({
        error: 'Failed to start timer',
        message: error.message
      })
    }
  }

  /**
   * Cancel cooking timer
   */
  async cancelTimer({ params, response }: HttpContext) {
    try {
      const order = await Order.findOrFail(params.id)
      
      if (order.status !== 'cooking') {
        return response.status(400).json({
          error: 'Order is not cooking',
          message: 'Only cooking orders can cancel timer'
        })
      }

      order.status = 'pending'
      order.timerStart = null
      order.timerEnd = null
      
      await order.save()

      return response.json({
        data: {
          id: order.id,
          status: order.status,
          timerStart: order.timerStart,
          timerEnd: order.timerEnd,
          updatedAt: order.updatedAt
        }
      })
    } catch (error) {
      return response.status(400).json({
        error: 'Failed to cancel timer',
        message: error.message
      })
    }
  }

  /**
   * Complete order
   */
  async complete({ params, request, response }: HttpContext) {
    try {
      const order = await Order.findOrFail(params.id)
      
      if (!['cooking', 'timer_expired'].includes(order.status)) {
        return response.status(400).json({
          error: 'Order cannot be completed',
          message: 'Only cooking or timer_expired orders can be completed'
        })
      }

      const { completedAt } = request.only(['completedAt'])
      
      order.status = 'ready'
      order.completedAt = completedAt ? DateTime.fromISO(completedAt) : DateTime.now()
      
      await order.save()

      return response.json({
        data: {
          id: order.id,
          status: order.status,
          completedAt: order.completedAt,
          updatedAt: order.updatedAt
        }
      })
    } catch (error) {
      return response.status(400).json({
        error: 'Failed to complete order',
        message: error.message
      })
    }
  }
}
