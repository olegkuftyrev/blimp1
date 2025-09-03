'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinTable: (tableId: number) => void
  joinKitchen: () => void
  leaveTable: (tableId: number) => void
  leaveKitchen: () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

interface WebSocketProviderProps {
  children: ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize Socket.IO connection
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3333'
    const newSocket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    })

    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error)
      setIsConnected(false)
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      newSocket.close()
    }
  }, [])

  const joinTable = (tableId: number) => {
    if (socket) {
      socket.emit('join:table', tableId)
      console.log(`🏠 Joined table ${tableId}`)
    }
  }

  const joinKitchen = () => {
    if (socket) {
      socket.emit('join:kitchen')
      console.log('👨‍🍳 Joined kitchen')
    }
  }

  const leaveTable = (tableId: number) => {
    if (socket) {
      socket.emit('leave:table', tableId)
      console.log(`🏠 Left table ${tableId}`)
    }
  }

  const leaveKitchen = () => {
    if (socket) {
      socket.emit('leave:kitchen')
      console.log('👨‍🍳 Left kitchen')
    }
  }

  const value: WebSocketContextType = {
    socket,
    isConnected,
    joinTable,
    joinKitchen,
    leaveTable,
    leaveKitchen
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}
