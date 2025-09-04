import Timer from 'timer-node'
import Order from '#models/order'
import WebSocketService from '#services/websocket_service'

export default class TimerService {
  private timers: Map<number, Timer> = new Map()
  private wsService = new WebSocketService()

  /**
   * Start a timer for an order
   */
  async startTimer(orderId: number, durationMinutes: number): Promise<void> {
    try {
      // Clear existing timer if any
      this.clearTimer(orderId)

      // Create new timer
      const timer = new Timer({
        label: `order-${orderId}`,
        startTimestamp: Date.now()
      })

      // Store timer reference
      this.timers.set(orderId, timer)

      // Start the timer
      timer.start()

      console.log(`⏰ Started timer for order ${orderId} (${durationMinutes} minutes)`)

      // Set timeout to handle timer expiration
      const timeoutId = setTimeout(async () => {
        await this.handleTimerExpiration(orderId)
      }, durationMinutes * 60 * 1000) // Convert minutes to milliseconds
      
      // Store timeout reference for potential cleanup
      timer.setData('timeoutId', timeoutId)

    } catch (error) {
      console.error(`Failed to start timer for order ${orderId}:`, error)
      throw error
    }
  }

  /**
   * Clear a timer for an order
   */
  clearTimer(orderId: number): void {
    const timer = this.timers.get(orderId)
    if (timer) {
      timer.stop()
      
      // Clear the timeout if it exists
      const timeoutId = timer.getData('timeoutId')
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      this.timers.delete(orderId)
      console.log(`⏹️ Cleared timer for order ${orderId}`)
    }
  }

  /**
   * Get timer status for an order
   */
  getTimerStatus(orderId: number): { isRunning: boolean; elapsed: number } | null {
    const timer = this.timers.get(orderId)
    if (!timer) {
      return null
    }

    return {
      isRunning: timer.isRunning(),
      elapsed: timer.time()
    }
  }

  /**
   * Handle timer expiration
   */
  private async handleTimerExpiration(orderId: number): Promise<void> {
    try {
      // Clear the timer
      this.clearTimer(orderId)

      // Update order status in database
      const order = await Order.find(orderId)
      if (order && order.status === 'cooking') {
        order.status = 'timer_expired'
        await order.save()
        await order.load('menuItem')

        // Emit WebSocket event for timer expired
        this.wsService.emitTimerExpired(order)

        console.log(`⏰ Timer expired for order ${orderId}`)
      }
    } catch (error) {
      console.error(`Failed to handle timer expiration for order ${orderId}:`, error)
    }
  }

  /**
   * Get all active timers
   */
  getActiveTimers(): number[] {
    return Array.from(this.timers.keys())
  }

  /**
   * Clear all timers
   */
  clearAllTimers(): void {
    for (const orderId of this.timers.keys()) {
      this.clearTimer(orderId)
    }
    console.log('⏹️ Cleared all timers')
  }

  /**
   * Get remaining time for an order (in seconds)
   */
  getRemainingTime(orderId: number, totalDurationMinutes: number): number {
    const timer = this.timers.get(orderId)
    if (!timer || !timer.isRunning()) {
      return 0
    }

    const elapsedSeconds = Math.floor(timer.time() / 1000)
    const totalSeconds = totalDurationMinutes * 60
    const remaining = Math.max(0, totalSeconds - elapsedSeconds)
    
    return remaining
  }
}
