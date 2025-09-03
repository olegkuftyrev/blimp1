'use client'

import { useEffect } from 'react'
import { useWebSocket } from '@/contexts/WebSocketContext'

interface OrderEvent {
  order: {
    id: number
    tableSection: number
    menuItemId: number
    batchSize: number
    status: string
    timerStart?: string
    timerEnd?: string
    completedAt?: string
    createdAt: string
    updatedAt: string
    menuItem: {
      id: number
      itemTitle: string
      batchBreakfast: number
      batchLunch: number
      batchDowntime: number
      batchDinner: number
      cookingTimeBatch1: number
      cookingTimeBatch2: number
      cookingTimeBatch3: number
      status: string
    }
  }
  timestamp: string
}

interface TimerEvent {
  order: {
    id: number
    tableSection: number
    menuItemId: number
    batchSize: number
    status: string
    timerStart: string
    timerEnd: string
    menuItem: {
      id: number
      itemTitle: string
    }
  }
  timestamp: string
}

export function useOrderEvents(
  onOrderCreated?: (event: OrderEvent) => void,
  onOrderUpdated?: (event: OrderEvent) => void,
  onOrderCompleted?: (event: OrderEvent) => void,
  onAllOrdersDeleted?: (event: { timestamp: string }) => void
) {
  const { socket } = useWebSocket()

  useEffect(() => {
    if (!socket) return

    if (onOrderCreated) {
      socket.on('order:created', onOrderCreated)
    }

    if (onOrderUpdated) {
      socket.on('order:updated', onOrderUpdated)
    }

    if (onOrderCompleted) {
      socket.on('order:completed', onOrderCompleted)
    }

    if (onAllOrdersDeleted) {
      socket.on('orders:all_deleted', onAllOrdersDeleted)
    }

    return () => {
      if (onOrderCreated) {
        socket.off('order:created', onOrderCreated)
      }
      if (onOrderUpdated) {
        socket.off('order:updated', onOrderUpdated)
      }
      if (onOrderCompleted) {
        socket.off('order:completed', onOrderCompleted)
      }
      if (onAllOrdersDeleted) {
        socket.off('orders:all_deleted', onAllOrdersDeleted)
      }
    }
  }, [socket, onOrderCreated, onOrderUpdated, onOrderCompleted, onAllOrdersDeleted])
}

export function useTimerEvents(
  onTimerStarted?: (event: TimerEvent) => void,
  onTimerExpired?: (event: TimerEvent) => void
) {
  const { socket } = useWebSocket()

  useEffect(() => {
    if (!socket) return

    if (onTimerStarted) {
      socket.on('timer:started', onTimerStarted)
    }

    if (onTimerExpired) {
      socket.on('timer:expired', onTimerExpired)
    }

    return () => {
      if (onTimerStarted) {
        socket.off('timer:started', onTimerStarted)
      }
      if (onTimerExpired) {
        socket.off('timer:expired', onTimerExpired)
      }
    }
  }, [socket, onTimerStarted, onTimerExpired])
}
