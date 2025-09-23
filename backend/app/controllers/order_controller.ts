import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import MenuItem from '#models/menu_item'
import WebSocketService from '#services/websocket_service'
import TimerService from '#services/timer_service'
import { DateTime } from 'luxon'

export default class OrderController {
  private wsService = new WebSocketService()
  private timerService = new TimerService()
  /**
   * Display a list of all orders for a specific restaurant
   */
  async index({ request, response }: HttpContext) {
    try {
      const restaurantId = request.input('restaurant_id', 1) // Default to restaurant 1
      const orders = await Order.query()
        .where('restaurantId', restaurantId)
        .preload('menuItem')
        .preload('restaurant')
      
      return response.json({
        data: orders
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to fetch orders',
        message: error.message
      })
    }
  }

  /**
   * Create a new order
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'tableSection',
        'menuItemId',
        'batchSize',
        'batchNumber',
        'restaurantId'
      ])

      // Validate that menu item exists
      await MenuItem.findOrFail(data.menuItemId)
      
      const order = new Order()
      order.tableSection = data.tableSection
      order.menuItemId = data.menuItemId
      order.batchSize = data.batchSize
      order.batchNumber = data.batchNumber || 1
      order.restaurantId = data.restaurantId || 1 // Default to restaurant 1
      order.status = 'pending'
      
      await order.save()
      await order.load('menuItem')
      await order.load('restaurant')

      // Emit WebSocket event for new order
      this.wsService.emitOrderCreated(order)

      return response.status(201).json({
        data: order
      })
    } catch (error) {
      return response.status(400).json({
        error: 'Failed to create order',
        message: error.message
      })
    }
  }

  /**
   * Display a single order
   */
  async show({ params, response }: HttpContext) {
    try {
      const order = await Order.query()
        .where('id', params.id)
        .preload('menuItem')
        .firstOrFail()
      
      return response.json({
        data: order
      })
    } catch (error) {
      return response.status(404).json({
        error: 'Order not found',
        message: error.message
      })
    }
  }

  /**
   * Update an order
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const order = await Order.findOrFail(params.id)
      
      const data = request.only([
        'tableSection',
        'menuItemId',
        'batchSize',
        'batchNumber',
        'status',
        'timerStart',
        'timerEnd',
        'completedAt'
      ])

      order.merge(data)
      await order.save()
      await order.load('menuItem')

      // Emit WebSocket event for order update
      this.wsService.emitOrderUpdated(order)

      return response.json({
        data: order
      })
    } catch (error) {
      return response.status(400).json({
        error: 'Failed to update order',
        message: error.message
      })
    }
  }

  /**
   * Delete an order
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const order = await Order.findOrFail(params.id)
      await order.load('menuItem')
      
      // Emit WebSocket event before deleting
      this.wsService.emitOrderDeleted(order)
      
      await order.delete()

      return response.status(204).send('')
    } catch (error) {
      return response.status(400).json({
        error: 'Failed to delete order',
        message: error.message
      })
    }
  }

  /**
   * Delete all orders
   */
  async destroyAll({ response }: HttpContext) {
    try {
      const deletedCount = await Order.query().delete()
      
      // Emit WebSocket event for all orders deleted
      this.wsService.emitAllOrdersDeleted()

      return response.json({
        message: 'All orders deleted successfully',
        deletedCount: deletedCount
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to delete all orders',
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
   * Complete an order
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

  /**
   * Add time to an expired order timer
   */
  async addTime({ params, request, response }: HttpContext) {
    try {
      const order = await Order.findOrFail(params.id)
      
      if (order.status !== 'timer_expired') {
        return response.status(400).json({
          error: 'Order is not expired',
          message: 'Only expired orders can have time added'
        })
      }

      const { additionalSeconds = 20 } = request.only(['additionalSeconds'])
      
      // Calculate new timer end time
      const now = DateTime.now()
      const newTimerEnd = now.plus({ seconds: additionalSeconds })

      // Update order status back to cooking and extend timer
      order.status = 'cooking'
      order.timerStart = now
      order.timerEnd = newTimerEnd
      
      await order.save()
      await order.load('menuItem')

      // Restart backend timer with new duration (convert seconds to minutes for TimerService)
      await this.timerService.startTimer(order.id, additionalSeconds / 60)

      // Emit WebSocket event for timer restarted
      this.wsService.emitTimerStarted(order)

      return response.json({
        data: {
          id: order.id,
          status: order.status,
          timerStart: order.timerStart,
          timerEnd: order.timerEnd,
          additionalSeconds,
          updatedAt: order.updatedAt
        }
      })
    } catch (error: any) {
      return response.status(400).json({
        error: 'Failed to add time to order',
        message: error.message
      })
    }
  }

  /**
   * Orders history for BOH (completed/deleted/cancelled)
   */
  async history({ request, response }: HttpContext) {
    try {
      const restaurantId = Number(request.input('restaurant_id', 1))

      const orders = await Order.query()
        .where('restaurantId', restaurantId)
        .where((q) => {
          q.whereIn('status', ['ready', 'completed', 'deleted', 'cancelled']).orWhereNotNull('deletedAt')
        })
        .preload('menuItem')
        .orderBy('updated_at', 'desc')

      const data = orders.map((o) => {
        // Compute duration in minutes
        const endTs = o.completedAt ?? o.deletedAt ?? o.updatedAt ?? o.createdAt
        const startTs = o.timerStart ?? o.createdAt
        const durationMinutes = Math.max(0, Math.round(endTs.diff(startTs, 'minutes').minutes))

        return {
          id: o.id,
          tableSection: o.tableSection,
          menuItemId: o.menuItemId,
          batchSize: o.batchSize,
          batchNumber: o.batchNumber,
          status: (o.deletedAt ? 'deleted' : (o.status as any)),
          timerStart: o.timerStart?.toISO() ?? undefined,
          timerEnd: o.timerEnd?.toISO() ?? undefined,
          completedAt: o.completedAt?.toISO() ?? undefined,
          deletedAt: o.deletedAt?.toISO() ?? undefined,
          createdAt: o.createdAt.toISO(),
          updatedAt: o.updatedAt.toISO(),
          duration: durationMinutes,
          menuItem: o.menuItem
            ? {
                id: o.menuItem.id,
                itemTitle: o.menuItem.itemTitle,
              }
            : undefined,
        }
      })

      return response.json({ data })
    } catch (error: any) {
      return response.status(500).json({ error: 'Failed to fetch order history', message: error.message })
    }
  }
}
