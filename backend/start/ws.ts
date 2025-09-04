import app from '@adonisjs/core/services/app'
import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'
import env from '#start/env'

app.ready(() => {
  const corsOrigins = env.get('WS_CORS_ORIGIN') === '*' 
    ? true 
    : env.get('WS_CORS_ORIGIN')?.split(',').map(origin => origin.trim()) || ['http://localhost:3000']
  
  const io = new Server(server.getNodeServer(), {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  console.log('🔌 WebSocket server initialized')

  io.on('connection', (socket) => {
    console.log(`📱 New client connected: ${socket.id}`)

    // Join table section rooms
    socket.on('join:table', (tableId: number) => {
      const room = `table:${tableId}`
      socket.join(room)
      console.log(`🏠 Client ${socket.id} joined table ${tableId}`)
    })

    // Join kitchen room
    socket.on('join:kitchen', () => {
      socket.join('kitchen')
      console.log(`👨‍🍳 Client ${socket.id} joined kitchen`)
    })

    // Leave table room
    socket.on('leave:table', (tableId: number) => {
      const room = `table:${tableId}`
      socket.leave(room)
      console.log(`🏠 Client ${socket.id} left table ${tableId}`)
    })

    // Leave kitchen room
    socket.on('leave:kitchen', () => {
      socket.leave('kitchen')
      console.log(`👨‍🍳 Client ${socket.id} left kitchen`)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`📱 Client ${socket.id} disconnected`)
    })
  })

  // Make io available globally for controllers
  global.socketIO = io
})
