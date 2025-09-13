import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import MenuItem from '#models/menu_item'
import WebSocketService from '#services/websocket_service'

export default class OrderController {
  private wsService = new WebSocketService()
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
}
