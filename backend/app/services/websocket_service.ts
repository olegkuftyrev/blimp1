import { Server } from 'socket.io'

export default class WebSocketService {
  private io: Server

  constructor() {
    this.io = (global as any).socketIO
  }

  /**
   * Emit order created event to kitchen and specific table
   */
  emitOrderCreated(order: any) {
    // Notify kitchen
    this.io.to('kitchen').emit('order:created', {
      order,
      timestamp: new Date().toISOString()
    })

    // Notify specific table
    const table = (order as any).table_section ?? (order as any).tableSection
    this.io.to(`table:${table}`).emit('order:created', {
      order,
      timestamp: new Date().toISOString()
    })

    console.log(`📢 Order created event sent for order ${order.id}`)
  }

  /**
   * Emit order updated event to kitchen and specific table
   */
  emitOrderUpdated(order: any) {
    // Notify kitchen
    this.io.to('kitchen').emit('order:updated', {
      order,
      timestamp: new Date().toISOString()
    })

    // Notify specific table
    const table = (order as any).table_section ?? (order as any).tableSection
    this.io.to(`table:${table}`).emit('order:updated', {
      order,
      timestamp: new Date().toISOString()
    })

    console.log(`📢 Order updated event sent for order ${order.id}`)
  }

  /**
   * Emit timer started event to kitchen and specific table
   */
  emitTimerStarted(order: any) {
    // Notify kitchen
    this.io.to('kitchen').emit('timer:started', {
      order,
      timestamp: new Date().toISOString()
    })

    // Notify specific table
    const table = (order as any).table_section ?? (order as any).tableSection
    this.io.to(`table:${table}`).emit('timer:started', {
      order,
      timestamp: new Date().toISOString()
    })

    console.log(`⏰ Timer started event sent for order ${order.id}`)
  }

  /**
   * Emit timer expired event to kitchen and specific table
   */
  emitTimerExpired(order: any) {
    // Notify kitchen
    this.io.to('kitchen').emit('timer:expired', {
      order,
      timestamp: new Date().toISOString()
    })

    // Notify specific table
    const table = (order as any).table_section ?? (order as any).tableSection
    this.io.to(`table:${table}`).emit('timer:expired', {
      order,
      timestamp: new Date().toISOString()
    })

    console.log(`⏰ Timer expired event sent for order ${order.id}`)
  }

  /**
   * Emit order completed event to kitchen and table
   */
  emitOrderCompleted(order: any) {
    // Notify kitchen
    this.io.to('kitchen').emit('order:completed', {
      order,
      timestamp: new Date().toISOString()
    })

    // Notify specific table
    const table = (order as any).table_section ?? (order as any).tableSection
    this.io.to(`table:${table}`).emit('order:completed', {
      order,
      timestamp: new Date().toISOString()
    })

    console.log(`✅ Order completed event sent for order ${order.id}`)
  }

  /**
   * Emit order deleted event to kitchen and specific table
   */
  emitOrderDeleted(order: any) {
    // Notify kitchen
    this.io.to('kitchen').emit('order:deleted', {
      order,
      timestamp: new Date().toISOString()
    })

    // Notify specific table
    const table = (order as any).table_section ?? (order as any).tableSection
    this.io.to(`table:${table}`).emit('order:deleted', {
      order,
      timestamp: new Date().toISOString()
    })

    console.log(`🗑️ Order deleted event sent for order ${order.id}`)
  }

  /**
   * Emit all orders deleted event to all clients
   */
  emitAllOrdersDeleted() {
    // Notify all clients
    this.io.emit('orders:all_deleted', {
      timestamp: new Date().toISOString()
    })

    console.log('🗑️ All orders deleted event sent to all clients')
  }
}
