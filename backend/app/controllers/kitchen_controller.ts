import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import { DateTime } from 'luxon'
import WebSocketService from '#services/websocket_service'
import TimerService from '#services/timer_service'

export default class KitchenController {
  private wsService = new WebSocketService()
  private timerService = new TimerService()
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

      // Start backend timer
      await this.timerService.startTimer(order.id, cookingTime)

      // Emit WebSocket event for timer started
      this.wsService.emitTimerStarted(order)

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

      // Clear backend timer
      this.timerService.clearTimer(order.id)

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
   * Get timer status for an order
   */
  async getTimerStatus({ params, response }: HttpContext) {
    try {
      const order = await Order.findOrFail(params.id)
      
      if (order.status !== 'cooking') {
        return response.status(400).json({
          error: 'Order is not cooking',
          message: 'Only cooking orders have active timers'
        })
      }

      const timerStatus = this.timerService.getTimerStatus(order.id)
      const remainingTime = this.timerService.getRemainingTime(order.id, order.timerEnd ? 
        Math.ceil((order.timerEnd.diffNow('minutes').minutes)) : 0)

      return response.json({
        data: {
          orderId: order.id,
          status: order.status,
          timerStatus,
          remainingTime,
          timerStart: order.timerStart,
          timerEnd: order.timerEnd
        }
      })
    } catch (error) {
      return response.status(400).json({
        error: 'Failed to get timer status',
        message: error.message
      })
    }
  }

  /**
   * Extend timer by 10 seconds
   */
  async extendTimer({ params, response }: HttpContext) {
    try {
      const order = await Order.findOrFail(params.id)
      
      if (order.status !== 'timer_expired') {
        return response.status(400).json({
          error: 'Order timer cannot be extended',
          message: 'Only timer_expired orders can have their timer extended'
        })
      }

      // Extend the timer by 10 seconds
      const now = DateTime.now()
      const newTimerEnd = now.plus({ seconds: 10 })

      order.status = 'cooking'
      order.timerEnd = newTimerEnd
      
      await order.save()
      await order.load('menuItem')

      // Restart the backend timer for 10 seconds
      await this.timerService.startTimer(order.id, 10/60) // Convert seconds to minutes

      // Emit WebSocket event for timer started
      this.wsService.emitTimerStarted(order)

      return response.json({
        data: {
          id: order.id,
          status: order.status,
          timerEnd: order.timerEnd,
          updatedAt: order.updatedAt
        }
      })
    } catch (error) {
      return response.status(400).json({
        error: 'Failed to extend timer',
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

      // Clear backend timer if still running
      this.timerService.clearTimer(order.id)

      const { completedAt } = request.only(['completedAt'])
      
      order.status = 'ready'
      order.completedAt = completedAt ? DateTime.fromISO(completedAt) : DateTime.now()
      
      await order.save()
      await order.load('menuItem')

      // Emit WebSocket event for order completed
      this.wsService.emitOrderCompleted(order)

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
