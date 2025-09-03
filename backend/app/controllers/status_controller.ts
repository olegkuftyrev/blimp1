import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'

export default class StatusController {
  /**
   * Get system status
   */
  async index({ response }: HttpContext) {
    try {
      const totalOrders = await Order.query().count('* as total')
      const pendingOrders = await Order.query().where('status', 'pending').count('* as total')
      const cookingOrders = await Order.query().whereIn('status', ['cooking', 'timer_expired']).count('* as total')
      const readyOrders = await Order.query().where('status', 'ready').count('* as total')

      return response.json({
        data: {
          system: 'online',
          orders: {
            total: totalOrders[0].total,
            pending: pendingOrders[0].total,
            cooking: cookingOrders[0].total,
            ready: readyOrders[0].total
          },
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to get system status',
        message: error.message
      })
    }
  }

  /**
   * Get table sections status
   */
  async tableSections({ response }: HttpContext) {
    try {
      const tableSections = []
      
      for (let section = 1; section <= 3; section++) {
        const orders = await Order.query()
          .where('table_section', section)
          .preload('menuItem')
          .orderBy('created_at', 'desc')

        const ordersWithRemainingTime = orders.map(order => {
          let remainingTime = null
          
          if (order.status === 'cooking' && order.timerEnd) {
            const now = new Date()
            const endTime = new Date(order.timerEnd.toString())
            const diff = endTime.getTime() - now.getTime()
            
            if (diff > 0) {
              remainingTime = Math.floor(diff / 1000) // seconds
            }
          }

          return {
            id: order.id,
            menuItem: {
              id: order.menuItem.id,
              itemTitle: order.menuItem.itemTitle
            },
            status: order.status,
            timerEnd: order.timerEnd,
            remainingTime
          }
        })

        tableSections.push({
          id: section,
          orders: ordersWithRemainingTime
        })
      }

      return response.json({
        data: {
          tableSections
        }
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to get table sections status',
        message: error.message
      })
    }
  }

  /**
   * Get kitchen status
   */
  async kitchen({ response }: HttpContext) {
    try {
      const pendingOrders = await Order.query()
        .where('status', 'pending')
        .preload('menuItem')
        .count('* as total')

      const cookingOrders = await Order.query()
        .whereIn('status', ['cooking', 'timer_expired'])
        .preload('menuItem')
        .count('* as total')

      const readyOrders = await Order.query()
        .where('status', 'ready')
        .preload('menuItem')
        .count('* as total')

      return response.json({
        data: {
          pending: pendingOrders[0].total,
          cooking: cookingOrders[0].total,
          ready: readyOrders[0].total,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to get kitchen status',
        message: error.message
      })
    }
  }
}
