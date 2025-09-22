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
    // Use same-origin so Next.js rewrites can proxy to backend
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || '/'
    const newSocket = io(wsUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server')
      console.log('🔌 Socket ID:', newSocket.id)
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

    // Add debug listeners for timer events
    newSocket.on('timer:expired', (event) => {
      console.log('🔔 Raw timer:expired event in WebSocketContext:', event)
    })

    newSocket.on('timer:started', (event) => {
      console.log('🔔 Raw timer:started event in WebSocketContext:', event)
    })

    setSocket(newSocket)

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
      console.log('👨‍🍳 Socket connected:', socket.connected)
      console.log('👨‍🍳 Socket ID:', socket.id)
    } else {
      console.error('👨‍🍳 Cannot join kitchen: socket is null')
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
    leaveKitchen,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}
