'use client'

import React from 'react'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff } from 'lucide-react'

interface WebSocketStatusProps {
  showIcon?: boolean
  className?: string
}

export function WebSocketStatus({ showIcon = true, className = '' }: WebSocketStatusProps) {
  const { isConnected } = useWebSocket()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        isConnected ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-600" />
        )
      )}
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className={isConnected ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {isConnected ? 'Connected' : 'Disconnected'}
      </Badge>
    </div>
  )
}

export function WebSocketStatusCard() {
  const { isConnected } = useWebSocket()

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">WebSocket Status</span>
      <WebSocketStatus />
    </div>
  )
}
