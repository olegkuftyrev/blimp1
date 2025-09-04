import Order from '#models/order'
import WebSocketService from '#services/websocket_service'

interface TimerData {
  timeoutId: NodeJS.Timeout
  startTime: number
  duration: number
}

export default class TimerService {
  private timers: Map<number, TimerData> = new Map()
  private wsService = new WebSocketService()

  /**
   * Start a timer for an order
   */
  async startTimer(orderId: number, durationMinutes: number): Promise<void> {
    try {
      // Clear existing timer if any
      this.clearTimer(orderId)

      const startTime = Date.now()
      const durationMs = durationMinutes * 60 * 1000

      // Set timeout to handle timer expiration
      const timeoutId = setTimeout(async () => {
        await this.handleTimerExpiration(orderId)
      }, durationMs)

      // Store timer data
      this.timers.set(orderId, {
        timeoutId,
        startTime,
        duration: durationMs
      })

      console.log(`⏰ Started timer for order ${orderId} (${durationMinutes} minutes)`)

    } catch (error) {
      console.error(`Failed to start timer for order ${orderId}:`, error)
      throw error
    }
  }

  /**
   * Clear a timer for an order
   */
  clearTimer(orderId: number): void {
    const timerData = this.timers.get(orderId)
    if (timerData) {
      // Clear the timeout
      clearTimeout(timerData.timeoutId)
      
      this.timers.delete(orderId)
      console.log(`⏹️ Cleared timer for order ${orderId}`)
    }
  }

  /**
   * Get timer status for an order
   */
  getTimerStatus(orderId: number): { isRunning: boolean; elapsed: number } | null {
    const timerData = this.timers.get(orderId)
    if (!timerData) {
      return null
    }

    const elapsed = Date.now() - timerData.startTime
    return {
      isRunning: true,
      elapsed: elapsed
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
    const timerData = this.timers.get(orderId)
    if (!timerData) {
      return 0
    }

    const elapsedMs = Date.now() - timerData.startTime
    const elapsedSeconds = Math.floor(elapsedMs / 1000)
    const totalSeconds = totalDurationMinutes * 60
    const remaining = Math.max(0, totalSeconds - elapsedSeconds)
    
    return remaining
  }
}
