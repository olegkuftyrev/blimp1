/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Web routes
router.on('/').render('pages/home')

// API routes (without CSRF protection)
router.group(() => {
  router.post('/auth/sign-up-invite', '#controllers/auth_controller.registerByInvite')
  router.post('/auth/sign-in', '#controllers/auth_controller.login')
  router.post('/auth/logout', '#controllers/auth_controller.logout').use(middleware.auth())
  router.get('/auth/me', '#controllers/auth_controller.me').use(middleware.auth())
  router.put('/auth/profile', '#controllers/auth_controller.updateProfile').use(middleware.auth())

  // Invites (create)
  router.post('/invites', '#controllers/invites_controller.create').use(middleware.auth())

  // Restaurants (protected)
  router
    .group(() => {
      router.get('/', '#controllers/restaurants_controller.index')
      router.get('/:id', '#controllers/restaurants_controller.show')
      router
        .post('/', '#controllers/restaurants_controller.store')
        .use(middleware.role(['admin', 'ops_lead', 'black_shirt']))
      router
        .put('/:id', '#controllers/restaurants_controller.update')
        .use(middleware.role(['admin', 'ops_lead', 'black_shirt']))
        .use(middleware.restaurantAccess(['id']))
      router
        .delete('/:id', '#controllers/restaurants_controller.destroy')
        .use(middleware.role(['admin', 'ops_lead', 'black_shirt']))
        .use(middleware.restaurantAccess(['id']))
    })
    .prefix('/restaurants')
    .use(middleware.auth())

  // Menu Items (protected)
  router
    .group(() => {
      router.get('/', '#controllers/menu_item_controller.index')
      router.get('/:id', '#controllers/menu_item_controller.show')
      router
        .put('/:id', '#controllers/menu_item_controller.update')
        .use(middleware.role(['admin', 'ops_lead', 'black_shirt']))
    })
    .prefix('/menu-items')
    .use(middleware.auth())

  // Orders (protected)
  router
    .group(() => {
      router.get('/', '#controllers/order_controller.index')
      router
        .post('/', '#controllers/order_controller.store')
        .use(middleware.role(['admin', 'ops_lead', 'black_shirt']))
      router.get('/:id', '#controllers/order_controller.show')
      router
        .put('/:id', '#controllers/order_controller.update')
        .use(middleware.role(['admin', 'ops_lead', 'black_shirt']))
      router
        .delete('/:id', '#controllers/order_controller.destroy')
        .use(middleware.role(['admin', 'ops_lead', 'black_shirt']))
      router
        .delete('/', '#controllers/order_controller.destroyAll')
        .use(middleware.role(['admin', 'ops_lead']))
    })
    .prefix('/orders')
    .use(middleware.auth())

  // Table Sections (protected)
  router.get('/table-sections', '#controllers/status_controller.tableSections').use(middleware.auth())

  // Kitchen (protected)
  router
    .group(() => {
      router.get('/orders', '#controllers/kitchen_controller.orders')
      router.get('/orders/pending', '#controllers/kitchen_controller.pendingOrders')
      router.get('/orders/cooking', '#controllers/kitchen_controller.cookingOrders')
      router
        .post('/orders/:id/start-timer', '#controllers/kitchen_controller.startTimer')
        .use(middleware.role(['admin', 'ops_lead', 'black_shirt']))
      router
        .post('/orders/:id/cancel-timer', '#controllers/kitchen_controller.cancelTimer')
        .use(middleware.role(['admin', 'ops_lead', 'black_shirt']))
      router
        .post('/orders/:id/extend-timer', '#controllers/kitchen_controller.extendTimer')
        .use(middleware.role(['admin', 'ops_lead', 'black_shirt']))
      router.get('/orders/:id/timer-status', '#controllers/kitchen_controller.getTimerStatus')
      router
        .post('/orders/:id/complete', '#controllers/kitchen_controller.complete')
        .use(middleware.role(['admin', 'ops_lead', 'black_shirt']))
      router
        .post('/test-timer-expiration', '#controllers/kitchen_controller.testTimerExpiration')
        .use(middleware.role(['admin']))
    })
    .prefix('/kitchen')
    .use(middleware.auth())

  // System Status (protected)
  router.get('/status', '#controllers/status_controller.index').use(middleware.auth())
  router.get('/status/table-sections', '#controllers/status_controller.tableSections').use(middleware.auth())
  router.get('/status/kitchen', '#controllers/status_controller.kitchen').use(middleware.auth())
  
  // Debug endpoint
  router.get('/debug/auth', ({ auth, response }) => {
    return response.json({ authenticated: !!auth.user, user: auth.user || null })
  })
  
  // Protected debug endpoint
  router.get('/debug/protected', ({ auth, response }) => {
    return response.json({ 
      message: 'This is protected!', 
      user: auth.user,
      authenticated: !!auth.user 
    })
  }).use(middleware.auth())
  
  // Simple auth test routes
  router.post('/simple-auth/login', '#controllers/simple_auth_controller.login')
  router.get('/simple-auth/me', '#controllers/simple_auth_controller.me')
  router.put('/simple-auth/profile', '#controllers/simple_auth_controller.updateProfile')
  
  // Simple auth menu items endpoint
  router.get('/simple-auth/menu-items', async ({ request, response }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      
      // Find token in database
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default
        .from('auth_access_tokens')
        .where('hash', token)
        .first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }
      
      const restaurantId = request.qs().restaurant_id
      if (!restaurantId) {
        return response.status(400).json({ error: 'restaurant_id is required' })
      }
      
      // Get menu items for the restaurant
      const MenuItem = await import('#models/menu_item')
      let menuItems
      
      // If restaurant_id is null or empty in menu_items, get all menu items
      const menuItemsWithRestaurant = await MenuItem.default.query()
        .where('restaurantId', restaurantId)
        .andWhere('status', 'available')
      
      if (menuItemsWithRestaurant.length === 0) {
        // Fallback: get all menu items if none are assigned to specific restaurant
        menuItems = await MenuItem.default.query().where('status', 'available')
      } else {
        menuItems = menuItemsWithRestaurant
      }
      
      console.log(`Fetching menu items for restaurant ${restaurantId}: ${menuItems.length} items`)
      
      return response.ok({ data: menuItems })
    } catch (error: any) {
      console.error('Error fetching menu items:', error)
      return response.status(500).json({ error: 'Failed to fetch menu items' })
    }
  })
  
  // Simple auth restaurants endpoint
  router.get('/simple-auth/restaurants', async ({ request, response }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      
      // Find token in database
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default
        .from('auth_access_tokens')
        .where('hash', token)
        .first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }
      
      // Find user
      const User = await import('#models/user')
      const user = await User.default.find(tokenRecord.tokenable_id)
      if (!user) {
        return response.status(401).json({ error: 'User not found' })
      }
      
      // Get restaurants based on user permissions
      const Restaurant = await import('#models/restaurant')
      let restaurants = []
      
      if (user.role === 'admin') {
        // Admin sees all restaurants
        restaurants = await Restaurant.default.query().where('isActive', true)
        console.log(`Admin ${user.email} accessing all restaurants`)
      } else {
        // Get restaurants user has access to
        const userRestaurantIds = await db.default
          .from('user_restaurants')
          .where('user_id', user.id)
          .pluck('restaurant_id')
        
        if (userRestaurantIds.length > 0) {
          restaurants = await Restaurant.default.query()
            .whereIn('id', userRestaurantIds)
            .andWhere('isActive', true)
        }
        console.log(`User ${user.email} (${user.role}) accessing ${restaurants.length} assigned restaurants`)
      }
      
      return response.ok({ data: restaurants })
    } catch (error: any) {
      console.error('Error fetching restaurants:', error)
      return response.status(500).json({ error: 'Failed to fetch restaurants' })
    }
  })

  // Simple auth restaurant update endpoint
  router.put('/simple-auth/restaurants/:id', async ({ request, response, params }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      
      // Find token in database
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default
        .from('auth_access_tokens')
        .where('hash', token)
        .first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }
      
      // Find user
      const User = await import('#models/user')
      const user = await User.default.find(tokenRecord.tokenable_id)
      if (!user) {
        return response.status(401).json({ error: 'User not found' })
      }

      // Check if user has permission to edit restaurants
      if (!['admin', 'ops_lead', 'black_shirt'].includes(user.role)) {
        return response.status(403).json({ error: 'You do not have permission to edit restaurant information' })
      }

      // Find restaurant
      const Restaurant = await import('#models/restaurant')
      const restaurant = await Restaurant.default.find(params.id)
      if (!restaurant) {
        return response.status(404).json({ error: 'Restaurant not found' })
      }

      // Get update data
      const { name, address, phone, isActive } = request.only(['name', 'address', 'phone', 'isActive'])

      // Validation
      if (!name?.trim()) {
        return response.status(400).json({ error: 'Restaurant name is required' })
      }
      if (!address?.trim()) {
        return response.status(400).json({ error: 'Restaurant address is required' })
      }
      if (!phone?.trim()) {
        return response.status(400).json({ error: 'Restaurant phone is required' })
      }

      // Update restaurant
      restaurant.name = name.trim()
      restaurant.address = address.trim()
      restaurant.phone = phone.trim()
      restaurant.isActive = isActive !== undefined ? isActive : restaurant.isActive

      await restaurant.save()

      console.log(`Restaurant ${restaurant.id} updated by ${user.email} (${user.role})`)

      return response.ok({ 
        data: restaurant,
        message: 'Restaurant updated successfully'
      })
    } catch (error: any) {
      console.error('Error updating restaurant:', error)
      
      // Handle unique constraint violation
      if (error.message?.includes('UNIQUE constraint failed') || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return response.status(400).json({ error: 'Restaurant name must be unique' })
      }
      
      return response.status(500).json({ 
        error: 'Failed to update restaurant',
        details: error.message 
      })
    }
  })
  
  // Simple auth orders endpoints
  router.get('/simple-auth/orders', async ({ request, response }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      
      // Find token in database
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default
        .from('auth_access_tokens')
        .where('hash', token)
        .first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }
      
      const restaurantId = request.qs().restaurant_id
      if (!restaurantId) {
        return response.status(400).json({ error: 'restaurant_id is required' })
      }
      
      // Get orders for the restaurant (exclude soft deleted)
      const Order = await import('#models/order')
      const orders = await Order.default.query()
        .where('restaurantId', restaurantId)
        .whereNull('deletedAt')
        .preload('menuItem')
        .orderBy('createdAt', 'desc')
      
      console.log(`Fetching orders for restaurant ${restaurantId}: ${orders.length} orders`)
      
      return response.ok({ data: orders })
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      return response.status(500).json({ error: 'Failed to fetch orders' })
    }
  })
  
  router.post('/simple-auth/orders', async ({ request, response }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      
      // Find token in database
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default
        .from('auth_access_tokens')
        .where('hash', token)
        .first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }
      
      const { tableSection, menuItemId, batchSize, batchNumber, restaurantId } = request.all()
      
      if (!tableSection || !menuItemId || !batchSize || !restaurantId) {
        return response.status(400).json({ 
          error: 'tableSection, menuItemId, batchSize, and restaurantId are required' 
        })
      }
      
      // Create order
      const Order = await import('#models/order')
      const order = await Order.default.create({
        tableSection,
        menuItemId,
        batchSize,
        batchNumber: batchNumber || 1,
        restaurantId,
        status: 'pending'
      })
      
      await order.load('menuItem')
      
      console.log(`Created order ${order.id} for restaurant ${restaurantId}`)
      
      return response.created({ data: order })
    } catch (error: any) {
      console.error('Error creating order:', error)
      return response.status(500).json({ error: 'Failed to create order' })
    }
  })
  
  router.delete('/simple-auth/orders/:id', async ({ request, response, params }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      
      // Find token in database
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default
        .from('auth_access_tokens')
        .where('hash', token)
        .first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }
      
      // Soft delete order
      const Order = await import('#models/order')
      const order = await Order.default.findOrFail(params.id)
      
      const { DateTime } = await import('luxon')
      order.deletedAt = DateTime.now()
      order.status = 'deleted'
      await order.save()
      
      console.log(`Soft deleted order ${params.id}`)
      
      return response.ok({ message: 'Order deleted successfully' })
    } catch (error: any) {
      console.error('Error deleting order:', error)
      return response.status(500).json({ error: 'Failed to delete order' })
    }
  })
  
  // Simple auth kitchen/timer endpoints
  router.post('/simple-auth/orders/:id/start-timer', async ({ request, response, params }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      
      // Find token in database
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default
        .from('auth_access_tokens')
        .where('hash', token)
        .first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }
      
      const Order = await import('#models/order')
      const order = await Order.default.findOrFail(params.id)
      
      if (order.status !== 'pending') {
        return response.status(400).json({
          error: 'Order is not in pending status',
          message: 'Only pending orders can start cooking timer'
        })
      }

      const { cookingTime } = request.only(['cookingTime'])
      const { DateTime } = await import('luxon')
      const now = DateTime.now()
      const timerEnd = now.plus({ minutes: cookingTime })

      // Update order with timer info
      order.status = 'cooking'
      order.timerStart = now
      order.timerEnd = timerEnd
      await order.save()
      await order.load('menuItem')

      // Start the timer service
      const TimerService = await import('#services/timer_service')
      const timerService = new TimerService.default()
      await timerService.startTimer(order.id, cookingTime)

      console.log(`⏰ Timer started for order ${order.id} (${cookingTime} minutes)`)

      return response.ok({ data: order })
    } catch (error: any) {
      console.error('Error starting timer:', error)
      return response.status(500).json({ error: 'Failed to start timer' })
    }
  })
  
  router.post('/simple-auth/orders/:id/complete', async ({ request, response, params }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      
      // Find token in database
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default
        .from('auth_access_tokens')
        .where('hash', token)
        .first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }
      
      const Order = await import('#models/order')
      const order = await Order.default.findOrFail(params.id)
      
      const { DateTime } = await import('luxon')
      
      // Update order status
      order.status = 'ready'
      order.completedAt = DateTime.now()
      await order.save()
      await order.load('menuItem')

      // Clear timer if it exists
      const TimerService = await import('#services/timer_service')
      const timerService = new TimerService.default()
      timerService.clearTimer(order.id)

      console.log(`✅ Order ${order.id} marked as completed`)

      return response.ok({ data: order })
    } catch (error: any) {
      console.error('Error completing order:', error)
      return response.status(500).json({ error: 'Failed to complete order' })
    }
  })
  
  // Simple auth orders history endpoint
  router.get('/simple-auth/orders-history', async ({ request, response }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      
      // Find token in database
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default
        .from('auth_access_tokens')
        .where('hash', token)
        .first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }
      
      const restaurantId = request.qs().restaurant_id
      if (!restaurantId) {
        return response.status(400).json({ error: 'restaurant_id is required' })
      }
      
      // Get ALL orders for the restaurant (including soft deleted and completed)
      const Order = await import('#models/order')
      const orders = await Order.default.query()
        .where('restaurantId', restaurantId)
        .whereIn('status', ['ready', 'completed', 'deleted', 'cancelled'])
        .preload('menuItem')
        .orderBy('updatedAt', 'desc')
      
      // Add duration calculation for completed orders
      const ordersWithDuration = orders.map(order => {
        let duration = 0
        if (order.timerStart && (order.completedAt || order.deletedAt)) {
          const endTime = order.completedAt || order.deletedAt
          duration = Math.round((endTime.toMillis() - order.timerStart.toMillis()) / (1000 * 60)) // minutes
        }
        
        return {
          ...order.toJSON(),
          duration
        }
      })
      
      console.log(`Fetching order history for restaurant ${restaurantId}: ${orders.length} orders`)
      
      return response.ok({ data: ordersWithDuration })
    } catch (error: any) {
      console.error('Error fetching order history:', error)
      return response.status(500).json({ error: 'Failed to fetch order history' })
    }
  })
  
  // Simple auth with policies - Restaurants
  router.get('/simple-auth/restaurants-v2', '#controllers/simple_restaurants_controller.index')
  router.get('/simple-auth/restaurants-v2/:id', '#controllers/simple_restaurants_controller.show')
  router.post('/simple-auth/restaurants-v2', '#controllers/simple_restaurants_controller.store')
  router.put('/simple-auth/restaurants-v2/:id', '#controllers/simple_restaurants_controller.update')
  router.delete('/simple-auth/restaurants-v2/:id', '#controllers/simple_restaurants_controller.destroy')
  
  // Simple auth with policies - Orders
  router.get('/simple-auth/orders-v2', '#controllers/simple_orders_controller.index')
  router.post('/simple-auth/orders-v2', '#controllers/simple_orders_controller.store')
  router.delete('/simple-auth/orders-v2/:id', '#controllers/simple_orders_controller.destroy')
  router.post('/simple-auth/orders-v2/:id/start-timer', '#controllers/simple_orders_controller.startTimer')
  router.post('/simple-auth/orders-v2/:id/complete', '#controllers/simple_orders_controller.complete')
  
  // Manual token test
  router.get('/debug/manual-auth', async ({ request, response }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token' })
      }
      
      const token = authHeader.substring(7)
      
      // Try to find token in database manually
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default
        .from('auth_access_tokens')
        .where('hash', token)
        .first()
      
      if (!tokenRecord) {
        // Try to find by hashing the token
        const crypto = await import('crypto')
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
        
        const hashedTokenRecord = await db.default
          .from('auth_access_tokens')
          .where('hash', hashedToken)
          .first()
          
        return response.json({
          originalToken: token.substring(0, 20) + '...',
          hashedToken: hashedToken,
          foundDirect: !!tokenRecord,
          foundHashed: !!hashedTokenRecord,
          tokenRecord: hashedTokenRecord || tokenRecord
        })
      }
      
      return response.json({
        originalToken: token.substring(0, 20) + '...',
        foundDirect: true,
        tokenRecord
      })
    } catch (error) {
      return response.status(500).json({ error: error.message })
    }
  })
}).prefix('/api')
