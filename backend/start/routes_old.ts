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

// Test endpoint to verify routes are loading
router.get('/test', ({ response }) => {
  return response.json({ message: 'Routes are working!', timestamp: new Date().toISOString() })
})

// Temporary auth endpoints (working)
router.post('/simple-auth/login', async ({ request, response }) => {
  const email = request.input('email') as string
  const password = request.input('password') as string
  
  if (!email || !password) {
    return response.badRequest({ error: 'email and password are required' })
  }

  // Simple hardcoded auth for testing
  if (email === 'admin@example.com' && password === 'pA55w0rd!') {
    const token = 'test_token_' + Date.now()
    return response.json({
      user: { 
        id: 1, 
        email: 'admin@example.com', 
        fullName: 'Admin User', 
        role: 'admin' 
      },
      token: token
    })
  }
  
  return response.unauthorized({ error: 'Invalid credentials' })
})

router.get('/simple-auth/me', async ({ request, response }) => {
  const authHeader = request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'No Bearer token provided' })
  }
  
  return response.json({
    user: { 
      id: 1, 
      email: 'admin@example.com', 
      fullName: 'Admin User', 
      role: 'admin' 
    },
    restaurant_ids: [1]
  })
})

// Quick fix for roles-performance
router.get('/simple-auth/roles-performance', async ({ response }) => {
  return response.json({
    success: true,
    data: [
      { id: 1, name: 'counter_help', displayName: 'Counter Help', description: 'Front counter operations', sortOrder: 1 },
      { id: 2, name: 'counter_help_cross_trained', displayName: 'Counter Help Cross-Trained', description: 'Cross-trained front counter operations', sortOrder: 2 },
      { id: 3, name: 'cook', displayName: 'Cook', description: 'Kitchen cooking operations', sortOrder: 3 },
      { id: 4, name: 'kitchen_help', displayName: 'Kitchen Help', description: 'Kitchen support operations', sortOrder: 4 },
      { id: 5, name: 'shift_lead', displayName: 'Shift Lead', description: 'Shift leadership and management', sortOrder: 5 }
    ]
  })
})

router.get('/simple-auth/roles-performance/progress/overall', async ({ response }) => {
  try {
    const itemCounts: { [key: number]: number } = { 1: 45, 2: 52, 3: 48, 4: 38, 5: 55 }
    const roleNames: { [key: number]: string } = { 1: 'counter_help', 2: 'counter_help_cross_trained', 3: 'cook', 4: 'kitchen_help', 5: 'shift_lead' }
    
    // Calculate real progress for each role
    const roles = []
    let totalItemsAcrossRoles = 0
    let totalAnsweredAcrossRoles = 0
    let totalYesAnswers = 0
    let completedRoles = 0
  
  for (let roleId = 1; roleId <= 5; roleId++) {
    const key = `role_${roleId}_user_1`
    const answers = userAnswers.get(key) || {}
    const totalItems = itemCounts[roleId] || 0
    const answeredItems = Object.keys(answers).length
    const yesAnswers = Object.values(answers).filter(answer => answer === 'yes').length
    const progress = totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0
    
    // Role is completed if 100% answered
    if (progress === 100) completedRoles++
    
    roles.push({
      roleId: roleId,
      roleName: roleNames[roleId],
      progress: progress,
      totalItems: totalItems,
      answeredItems: answeredItems,
      yesAnswers: yesAnswers
    })
    
    totalItemsAcrossRoles += totalItems
    totalAnsweredAcrossRoles += answeredItems
    totalYesAnswers += yesAnswers
  }
  
  const overallProgressPercentage = totalItemsAcrossRoles > 0 
    ? Math.round((totalAnsweredAcrossRoles / totalItemsAcrossRoles) * 100) 
    : 0
  
  const result = {
    success: true,
    data: {
      roles: roles,
      overall: {
        totalRoles: 5,
        completedRoles: completedRoles,
        totalItemsAcrossRoles: totalItemsAcrossRoles,
        totalAnsweredAcrossRoles: totalAnsweredAcrossRoles,
        totalYesAnswers: totalYesAnswers,
        overallProgressPercentage: overallProgressPercentage
      }
    }
  }
  
    console.log('📊 Overall progress calculated:', result.data.overall)
    return response.json(result)
  } catch (error) {
    console.error('💥 Error in overall progress endpoint:', error)
    return response.status(500).json({
      success: false,
      error: 'Internal server error while calculating progress',
      details: error.message
    })
  }
})

// Individual role performance endpoints
router.get('/simple-auth/roles-performance/:id', async ({ params, response }) => {
  const roleId = parseInt(params.id)
  
  // Mock data based on roleId
  const roleData: { [key: number]: any } = {
    1: { name: 'counter_help', displayName: 'Counter Help', sections: generateMockSections('Counter Help', 45) },
    2: { name: 'counter_help_cross_trained', displayName: 'Counter Help Cross-Trained', sections: generateMockSections('Counter Help Cross-Trained', 52) },
    3: { name: 'cook', displayName: 'Cook', sections: generateMockSections('Cook', 48) },
    4: { name: 'kitchen_help', displayName: 'Kitchen Help', sections: generateMockSections('Kitchen Help', 38) },
    5: { name: 'shift_lead', displayName: 'Shift Lead', sections: generateMockSections('Shift Lead', 55) }
  }
  
  const role = roleData[roleId]
  if (!role) {
    return response.status(404).json({ error: 'Role not found' })
  }
  
  return response.json({
    success: true,
    data: {
      id: roleId,
      ...role,
      sortOrder: roleId
    }
  })
})

router.get('/simple-auth/roles-performance/:id/answers', async ({ params, response }) => {
  const roleId = parseInt(params.id)
  
  // Get answers from in-memory storage
  const key = `role_${roleId}_user_1` // user_1 is hardcoded for now
  const answers = userAnswers.get(key) || {}
  
  console.log('📖 Backend: Loading answers for role', roleId, ':', answers)
  
  return response.json({
    success: true,
    data: {
      roleId: roleId,
      answers: answers
    }
  })
})

router.get('/simple-auth/roles-performance/:id/progress', async ({ params, response }) => {
  const roleId = parseInt(params.id)
  
  const itemCounts: { [key: number]: number } = { 1: 45, 2: 52, 3: 48, 4: 38, 5: 55 }
  const totalItems = itemCounts[roleId] || 50
  
  // Calculate real progress from saved answers
  const key = `role_${roleId}_user_1`
  const answers = userAnswers.get(key) || {}
  const answeredItems = Object.keys(answers).length
  const yesAnswers = Object.values(answers).filter(answer => answer === 'yes').length
  const noAnswers = Object.values(answers).filter(answer => answer === 'no').length
  const progress = totalItems > 0 ? Math.round((answeredItems / totalItems) * 100) : 0
  
  const progressData = {
    roleId: roleId,
    totalItems: totalItems,
    answeredItems: answeredItems,
    yesAnswers: yesAnswers,
    noAnswers: noAnswers,
    progress: progress
  }
  
  console.log('📊 Backend: Progress for role', roleId, ':', progressData)
  
  return response.json({
    success: true,
    data: progressData
  })
})

// Helper function to generate mock sections
function generateMockSections(roleName: string, itemCount: number) {
  const sectionsCount = Math.ceil(itemCount / 10) // ~10 items per section
  const sections = []
  
  for (let i = 1; i <= sectionsCount; i++) {
    const itemsInSection = Math.min(10, itemCount - (i - 1) * 10)
    const items = []
    
    for (let j = 1; j <= itemsInSection; j++) {
      items.push({
        id: (i - 1) * 10 + j,
        description: `${roleName} skill ${(i - 1) * 10 + j}`,
        isRequired: true
      })
    }
    
    sections.push({
      id: i,
      title: `${roleName} Section ${i}`,
      items: items
    })
  }
  
  return sections
}

// In-memory storage for answers (in real app would be in database)
const userAnswers = new Map()

// In-memory storage for orders (in real app would be in database)
const ordersStorage = new Map()

// Initialize with some test data for demonstration
userAnswers.set('role_2_user_1', {
  "1": "yes", "2": "no", "3": "yes", "4": "yes", "5": "yes", "6": "yes", "7": "yes", 
  "11": "yes", "12": "yes", "13": "no", "41": "yes", "42": "yes", "43": "yes", 
  "44": "yes", "45": "yes", "46": "yes", "47": "no", "48": "yes", "49": "no", 
  "50": "yes", "52": "yes"
})

userAnswers.set('role_3_user_1', {
  "1": "yes", "2": "yes", "5": "no", "7": "no", "11": "no", "13": "yes", "14": "yes", "16": "yes"
})

// Save answer for role performance item
router.post('/simple-auth/roles-performance/:roleId/answers', async ({ params, request, response }) => {
  try {
    const roleId = parseInt(params.roleId)
    const { performanceItemId, answer } = request.body()
    
    console.log('🔄 Backend: Saving answer:', { roleId, performanceItemId, answer })
  
  // Save to in-memory storage
  const key = `role_${roleId}_user_1` // user_1 is hardcoded for now
  if (!userAnswers.has(key)) {
    userAnswers.set(key, {})
  }
  const roleAnswers = userAnswers.get(key)
  roleAnswers[performanceItemId] = answer
  
  const result = {
    success: true,
    message: 'Answer saved successfully',
    data: {
      roleId: roleId,
      performanceItemId: performanceItemId,
      answer: answer,
      savedAt: new Date().toISOString()
    }
  }
  
    console.log('✅ Backend: Answer saved:', result)
    console.log('📊 All answers for role:', roleAnswers)
    return response.json(result)
  } catch (error) {
    console.error('💥 Error saving answer:', error)
    return response.status(500).json({
      success: false,
      error: 'Failed to save answer',
      details: error.message
    })
  }
})

// IDP endpoints - use real controllers with auth middleware
router.group(() => {
  router.get('/idp/roles', '#controllers/idp_controller.getRoles')
  router.get('/idp/role/current', '#controllers/idp_controller.getCurrentUserRole')  
  router.get('/idp/roles/:userRole', '#controllers/idp_controller.getRoleByUserRole')
  router.get('/idp/assessment/current', '#controllers/idp_controller.getCurrentAssessment')
  router.post('/idp/assessment/answers', '#controllers/idp_controller.saveAnswers')
  router.post('/idp/assessment/complete', '#controllers/idp_controller.completeAssessment')
  router.post('/idp/assessment/reset', '#controllers/idp_controller.resetAssessment')
}).prefix('/simple-auth').middleware(middleware.auth())

router.get('/simple-auth/idp/assessment/current', async ({ request, response }) => {
  const authHeader = request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'No Bearer token provided' })
  }
  
  return response.json({
    data: {
      id: 1,
      userId: 1,
      roleId: 1,
      version: 1,
      status: 'draft',
      isActive: true,
      answers: []
    },
    message: 'Assessment retrieved successfully'
  })
})

router.post('/simple-auth/idp/assessment/answers', async ({ request, response }) => {
  const authHeader = request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'No Bearer token provided' })
  }
  
  return response.json({
    message: 'Answers saved successfully'
  })
})

// Complete assessment endpoint
router.post('/simple-auth/idp/assessment/complete', async ({ request, response }) => {
  const authHeader = request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'No Bearer token provided' })
  }
  
  return response.json({
    data: {
      assessment: {
        id: 1,
        userId: 1,
        status: 'completed',
        completedAt: new Date().toISOString(),
        answers: {}
      },
      scores: {
        strategic_mindset: 4.5,
        leadership: 4.0,
        communication: 3.8,
        problem_solving: 4.2
      }
    },
    message: 'Assessment completed successfully'
  })
})

// Reset assessment endpoint
router.post('/simple-auth/idp/assessment/reset', async ({ request, response }) => {
  const authHeader = request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'No Bearer token provided' })
  }
  
  return response.json({
    data: {
      assessment: {
        id: 1,
        userId: 1,
        status: 'in_progress',
        completedAt: null,
        answers: {}
      },
      scores: {}
    },
    message: 'Assessment reset successfully'
  })
})

// Quick fix for restaurants endpoint
router.get('/simple-auth/restaurants', async ({ request, response }) => {
  const authHeader = request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'No Bearer token provided' })
  }
  
  return response.json({
    data: [
      { id: 1, name: 'Panda Express PX1234', address: '123 Main St', phone: '555-0123', isActive: true },
      { id: 2, name: 'Panda Express PX5678', address: '456 Oak Ave', phone: '555-0456', isActive: true }
    ]
  })
})

// Quick fix for orders endpoint
router.get('/simple-auth/orders', async ({ request, response }) => {
  const authHeader = request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'No Bearer token provided' })
  }
  
  const restaurantId = request.qs().restaurant_id
  console.log('🍽️ Loading orders for restaurant:', restaurantId)
  
  // Get orders from in-memory storage + some initial mock data
  const storageKey = `orders_restaurant_${restaurantId || 'all'}`
  let allOrders = ordersStorage.get(storageKey) || []
  
  // Add some initial mock data if storage is empty
  if (allOrders.length === 0) {
    const initialOrders = [
      { id: 1, restaurantId: 1, tableSection: 1, status: 'preparing', batchSize: 2, timerStart: new Date(Date.now() - 15 * 60000).toISOString(), menuItem: { itemTitle: 'Orange Chicken' }, menuItemId: 1 },
      { id: 2, restaurantId: 1, tableSection: 3, status: 'ready', batchSize: 1, timerEnd: new Date(Date.now() - 5 * 60000).toISOString(), menuItem: { itemTitle: 'Beef Broccoli' }, menuItemId: 2 },
      { id: 3, restaurantId: 1, tableSection: 2, status: 'pending', batchSize: 3, menuItem: { itemTitle: 'Fried Rice' }, menuItemId: 3 },
      { id: 4, restaurantId: 2, tableSection: 4, status: 'preparing', batchSize: 1, timerStart: new Date(Date.now() - 8 * 60000).toISOString(), menuItem: { itemTitle: 'Sweet & Sour Pork' }, menuItemId: 5 },
      { id: 5, restaurantId: 2, tableSection: 1, status: 'pending', batchSize: 2, menuItem: { itemTitle: 'Chow Mein' }, menuItemId: 6 }
    ]
    ordersStorage.set(storageKey, initialOrders)
    allOrders = initialOrders
  }
  
  // Filter by restaurant if provided
  const filteredOrders = restaurantId 
    ? allOrders.filter(order => order.restaurantId === parseInt(restaurantId))
    : allOrders
  
  return response.json({
    data: filteredOrders
  })
})

// Create new order endpoint
router.post('/simple-auth/orders', async ({ request, response }) => {
  const authHeader = request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'No Bearer token provided' })
  }
  
  const { restaurantId, tableSection, menuItemId, batchSize } = request.body()
  console.log('🍽️ Creating new order:', { restaurantId, tableSection, menuItemId, batchSize })
  
  // Generate new order ID
  const newOrderId = Date.now()
  
  const newOrder = {
    id: newOrderId,
    restaurantId: parseInt(restaurantId),
    tableSection: parseInt(tableSection),
    status: 'pending',
    batchSize: parseInt(batchSize),
    batchNumber: 1, // Default to batch 1, should be calculated properly
    menuItemId: parseInt(menuItemId),
    menuItem: {
      id: parseInt(menuItemId),
      itemTitle: `Menu Item ${menuItemId}`, // Mock menu item title
      batchBreakfast: 1,
      batchLunch: 2,
      batchDowntime: 1,
      batchDinner: 2,
      cookingTimeBatch1: 8,
      cookingTimeBatch2: 10,
      cookingTimeBatch3: 12,
      status: 'available'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Save to in-memory storage
  const storageKey = `orders_restaurant_${restaurantId}`
  const existingOrders = ordersStorage.get(storageKey) || []
  existingOrders.push(newOrder)
  ordersStorage.set(storageKey, existingOrders)
  
  console.log('✅ Order created and saved:', newOrder)
  console.log('📊 Total orders for restaurant:', existingOrders.length)
  
  return response.json({
    success: true,
    data: newOrder,
    message: 'Order created successfully'
  })
})

// Menu items endpoint - use real controller
router.get('/simple-auth/menu-items', '#controllers/menu_item_controller.index')

// BOH endpoints for order management
router.post('/simple-auth/orders/:id/start-timer', async ({ request, response, params }) => {
  const authHeader = request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'No Bearer token provided' })
  }
  
  const orderId = parseInt(params.id)
  const { cookingTime } = request.body()
  
  console.log('⏰ Starting timer for order:', { orderId, cookingTime })
  
  // Update order in storage
  const allStorageKeys = Array.from(ordersStorage.keys())
  let orderFound = false
  
  for (const key of allStorageKeys) {
    const orders = ordersStorage.get(key) || []
    const orderIndex = orders.findIndex(o => o.id === orderId)
    
    if (orderIndex !== -1) {
      orders[orderIndex] = {
        ...orders[orderIndex],
        status: 'cooking',
        timerStart: new Date().toISOString(),
        timerEnd: new Date(Date.now() + cookingTime * 60000).toISOString()
      }
      ordersStorage.set(key, orders)
      orderFound = true
      console.log('✅ Order updated in storage:', orders[orderIndex])
      break
    }
  }
  
  if (!orderFound) {
    console.log('⚠️ Order not found in storage:', orderId)
  }
  
  return response.json({
    success: true,
    data: {
      orderId: orderId,
      timerStart: new Date().toISOString(),
      timerEnd: new Date(Date.now() + cookingTime * 60000).toISOString(),
      status: 'cooking'
    },
    message: 'Timer started successfully'
  })
})

router.post('/simple-auth/orders/:id/complete', async ({ request, response, params }) => {
  const authHeader = request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'No Bearer token provided' })
  }
  
  const orderId = parseInt(params.id)
  
  console.log('✅ Completing order:', orderId)
  
  return response.json({
    success: true,
    data: {
      orderId: orderId,
      status: 'ready',
      completedAt: new Date().toISOString()
    },
    message: 'Order completed successfully'
  })
})

router.delete('/simple-auth/orders/:id', async ({ request, response, params }) => {
  const authHeader = request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'No Bearer token provided' })
  }
  
  const orderId = parseInt(params.id)
  
  console.log('🗑️ Deleting order:', orderId)
  
  return response.json({
    success: true,
    data: {
      orderId: orderId,
      deletedAt: new Date().toISOString()
    },
    message: 'Order deleted successfully'
  })
})

// BOH history endpoint
router.get('/simple-auth/orders-history', async ({ request, response }) => {
  const authHeader = request.header('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'No Bearer token provided' })
  }
  
  const restaurantId = request.qs().restaurant_id
  
  // Mock historical orders
  const historyOrders = [
    { id: 101, restaurantId: 1, tableSection: 1, status: 'completed', menuItem: { itemTitle: 'Orange Chicken' }, batchSize: 2, duration: 8, completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 102, restaurantId: 2, tableSection: 3, status: 'completed', menuItem: { itemTitle: 'Sweet & Sour Pork' }, batchSize: 1, duration: 12, completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() }
  ]
  
  const filteredHistory = restaurantId 
    ? historyOrders.filter(order => order.restaurantId === parseInt(restaurantId))
    : historyOrders
  
  return response.json({
    data: filteredHistory
  })
})

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

  // Debug endpoint (no auth middleware)
  router.get('/users/debug', '#controllers/users_controller.debug')
  
  // Test endpoint without auth
  router.get('/users/test', ({ response }) => {
    return response.json({ message: 'Test endpoint works', timestamp: new Date() })
  })

  // Users management (no auth middleware for now)
  router
    .group(() => {
      router.get('/', '#controllers/users_controller.index')
      router.get('/team', '#controllers/users_controller.getTeamMembers')
      router.post('/', '#controllers/users_controller.store')
      router.put('/:id', '#controllers/users_controller.update')
      router.delete('/:id', '#controllers/users_controller.destroy')
    })
    .prefix('/users')

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
        const userRestaurantRecords = await db.default
          .from('user_restaurants')
          .where('user_id', user.id)
          .select('restaurant_id')
        const userRestaurantIds = userRestaurantRecords.map(record => record.restaurant_id)
        
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
      if (error.message?.includes('UNIQUE constraint failed') || error.code === '23505') {
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
  
  // Simple auth - IDP endpoints (temporary for testing)
  router.get('/simple-auth/idp/roles', async ({ request, response }) => {
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
      
      // Get IDP roles
      const IdpRole = await import('#models/idp_role')
      const roles = await IdpRole.default.query()
        .where('isActive', true)
        .orderBy('id')

      return response.ok({
        data: roles,
        message: 'IDP roles retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error fetching IDP roles:', error)
      return response.status(500).json({ error: 'Failed to fetch IDP roles' })
    }
  })
  
  router.get('/simple-auth/idp/role/current', async ({ request, response }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default.from('auth_access_tokens').where('hash', token).first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }
      
      const User = await import('#models/user')
      const user = await User.default.find(tokenRecord.tokenable_id)
      
      if (!user) {
        return response.status(401).json({ error: 'User not found' })
      }
      
      const IdpRole = await import('#models/idp_role')
      const role = await IdpRole.default.query()
        .where('user_role', user.role)
        .where('isActive', true)
        .preload('competencies', (competencyQuery) => {
          competencyQuery
            .where('isActive', true)
            .orderBy('sortOrder')
            .preload('questions', (questionQuery) => {
              questionQuery.where('isActive', true).orderBy('sortOrder')
            })
            .preload('actions', (actionQuery) => {
              actionQuery.where('isActive', true).orderBy('sortOrder')
            })
            .preload('descriptions', (descQuery) => {
              descQuery.where('isActive', true).orderBy('sortOrder')
            })
        })
        .first()

      if (!role) {
        return response.status(404).json({ error: 'Role not found for user role' })
      }

      return response.ok({
        data: role,
        message: 'IDP role with competencies retrieved successfully'
      })
    } catch (error) {
      console.error('Error fetching current user IDP role:', error)
      return response.status(500).json({ error: 'Failed to fetch IDP role' })
    }
  })

  router.get('/simple-auth/idp/roles/:userRole', '#controllers/idp_controller.getRoleByUserRole')
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
      
      const { userRole } = params
      
      // Get IDP role with competencies
      const IdpRole = await import('#models/idp_role')
      const role = await IdpRole.default.query()
        .where('user_role', userRole)
        .where('isActive', true)
        .preload('competencies', (competencyQuery) => {
          competencyQuery
            .where('isActive', true)
            .orderBy('sortOrder')
            .preload('questions', (questionQuery) => {
              questionQuery.where('isActive', true).orderBy('sortOrder')
            })
            .preload('actions', (actionQuery) => {
              actionQuery.where('isActive', true).orderBy('sortOrder')
            })
            .preload('descriptions', (descQuery) => {
              descQuery.where('isActive', true).orderBy('sortOrder')
            })
        })
        .first()

      if (!role) {
        return response.status(404).json({ error: 'Role not found for user role' })
      }

      return response.ok({
        data: role,
        message: 'IDP role with competencies retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error fetching IDP role:', error)
      return response.status(500).json({ error: 'Failed to fetch IDP role' })
    }
  })
  
  router.get('/simple-auth/idp/assessment/current', async ({ request, response }) => {
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

      // Find active assessment
      const IdpAssessment = await import('#models/idp_assessment')
      let assessment = await IdpAssessment.default.query()
        .where('userId', user.id)
        .where('isActive', true)
        .whereNull('deletedAt')
        .preload('role')
        .preload('answers', (answerQuery) => {
          answerQuery.preload('question')
        })
        .first()

      if (!assessment) {
        // Find role based on user's role
        const IdpRole = await import('#models/idp_role')
        const role = await IdpRole.default.query()
          .where('user_role', user.role)
          .where('isActive', true)
          .first()

        if (!role) {
          return response.status(400).json({ 
            error: 'No IDP role found for your user role',
            userRole: user.role 
          })
        }

        // Create new assessment
        assessment = await IdpAssessment.default.create({
          userId: user.id,
          roleId: role.id,
          version: 1,
          status: 'draft',
          isActive: true,
        })

        await assessment.load('role')
        await assessment.load('answers')
      }

      return response.ok({
        data: assessment,
        message: 'Current assessment retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error fetching current assessment:', error)
      return response.status(500).json({ error: 'Failed to fetch current assessment' })
    }
  })
  
  router.post('/simple-auth/idp/assessment/answers', async ({ request, response }) => {
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

      const { answers } = request.only(['answers'])

      // Get current active assessment
      const IdpAssessment = await import('#models/idp_assessment')
      const assessment = await IdpAssessment.default.query()
        .where('userId', user.id)
        .where('isActive', true)
        .whereNull('deletedAt')
        .first()

      if (!assessment) {
        return response.status(404).json({ error: 'No active assessment found' })
      }

      // Update assessment status
      if (assessment.status === 'draft') {
        const { DateTime } = await import('luxon')
        assessment.status = 'in_progress'
        assessment.startedAt = DateTime.now()
        await assessment.save()
      }

      // Save/update answers
      const IdpAssessmentAnswer = await import('#models/idp_assessment_answer')
      for (const [questionIdStr, answer] of Object.entries(answers)) {
        const questionId = parseInt(questionIdStr)
        
        // Upsert answer
        const existingAnswer = await IdpAssessmentAnswer.default.query()
          .where('assessmentId', assessment.id)
          .where('questionId', questionId)
          .first()

        if (existingAnswer) {
          existingAnswer.answer = answer as 'yes' | 'no'
          await existingAnswer.save()
        } else {
          await IdpAssessmentAnswer.default.create({
            assessmentId: assessment.id,
            questionId: questionId,
            answer: answer as 'yes' | 'no',
          })
        }
      }

      return response.ok({
        message: 'Answers saved successfully'
      })
    } catch (error: any) {
      console.error('Error saving answers:', error)
      return response.status(500).json({ error: 'Failed to save answers' })
    }
  })
  
  router.post('/simple-auth/idp/assessment/complete', async ({ request, response }) => {
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

      // Get current active assessment
      const IdpAssessment = await import('#models/idp_assessment')
      const assessment = await IdpAssessment.default.query()
        .where('userId', user.id)
        .where('isActive', true)
        .whereNull('deletedAt')
        .preload('role', (roleQuery) => {
          roleQuery.preload('competencies', (competencyQuery) => {
            competencyQuery
              .where('isActive', true)
              .preload('questions', (questionQuery) => {
                questionQuery.where('isActive', true).orderBy('sortOrder')
              })
              .preload('actions', (actionQuery) => {
                actionQuery.where('isActive', true).orderBy('sortOrder')
              })
              .preload('descriptions', (descQuery) => {
                descQuery.where('isActive', true).orderBy('sortOrder')
              })
          })
        })
        .preload('answers', (answerQuery) => {
          answerQuery.preload('question')
        })
        .first()

      if (!assessment) {
        return response.status(404).json({ error: 'No active assessment found' })
      }

      // Calculate competency scores
      const scores = await assessment.getCompetencyScores()

      // Mark assessment as completed
      const { DateTime } = await import('luxon')
      assessment.status = 'completed'
      assessment.completedAt = DateTime.now()
      await assessment.save()

      return response.ok({
        data: {
          assessment,
          scores
        },
        message: 'Assessment completed successfully'
      })
    } catch (error: any) {
      console.error('Error completing assessment:', error)
      return response.status(500).json({ error: 'Failed to complete assessment' })
    }
  })
  
  router.post('/simple-auth/idp/assessment/reset', async ({ request, response }) => {
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

      // Soft delete current active assessment and all its answers
      const IdpAssessment = await import('#models/idp_assessment')
      const assessment = await IdpAssessment.default.query()
        .where('userId', user.id)
        .where('isActive', true)
        .whereNull('deletedAt')
        .first()

      if (assessment) {
        const { DateTime } = await import('luxon')
        
        // Soft delete the assessment
        assessment.deletedAt = DateTime.now()
        assessment.isActive = false
        await assessment.save()

        // Delete all answers for this assessment
        const IdpAssessmentAnswer = await import('#models/idp_assessment_answer')
        await IdpAssessmentAnswer.default.query()
          .where('assessmentId', assessment.id)
          .delete()

        console.log(`Reset IDP assessment ${assessment.id} for user ${user.email}`)
      }

      return response.ok({
        message: 'IDP assessment reset successfully'
      })
    } catch (error: any) {
      console.error('Error resetting IDP assessment:', error)
      return response.status(500).json({ error: 'Failed to reset IDP assessment' })
    }
  })
  
  // Get a specific user's IDP assessment (with permission check)
  router.get('/simple-auth/idp/assessment/user/:userId', async ({ request, response, params }) => {
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

      // Find current user
      const User = await import('#models/user')
      const currentUser = await User.default.find(tokenRecord.tokenable_id)
      if (!currentUser) {
        return response.status(401).json({ error: 'User not found' })
      }

      const targetUserId = parseInt(params.userId)
      if (isNaN(targetUserId)) {
        return response.status(400).json({ error: 'Invalid user ID' })
      }

      // Check if current user has permission to view this user's IDP
      // Same permissions as viewing team members
      let hasPermission = false
      
      if (currentUser.role === 'admin') {
        hasPermission = true
      } else {
        // For non-admin users, check if they share restaurants with the target user
        const UserRestaurant = await import('#models/user_restaurant')
        const currentUserRestaurants = await UserRestaurant.default.query()
          .where('user_id', currentUser.id)
          .select('restaurant_id')
        
        const targetUserRestaurants = await UserRestaurant.default.query()
          .where('user_id', targetUserId)
          .select('restaurant_id')
        
        const currentRestaurantIds = currentUserRestaurants.map(ur => ur.restaurantId)
        const targetRestaurantIds = targetUserRestaurants.map(ur => ur.restaurantId)
        
        // Check if they share any restaurants
        hasPermission = currentRestaurantIds.some(id => targetRestaurantIds.includes(id))
      }

      if (!hasPermission) {
        return response.status(403).json({ error: 'You can only view IDPs of your team members' })
      }

      // Find the target user
      const targetUser = await User.default.find(targetUserId)
      if (!targetUser) {
        return response.status(404).json({ error: 'User not found' })
      }

      // Find active assessment for the target user
      const IdpAssessment = await import('#models/idp_assessment')
      let assessment = await IdpAssessment.default.query()
        .where('userId', targetUserId)
        .where('isActive', true)
        .whereNull('deletedAt')
        .preload('role', (roleQuery) => {
          roleQuery.preload('competencies', (competencyQuery) => {
            competencyQuery
              .where('isActive', true)
              .orderBy('sortOrder')
              .preload('questions', (questionQuery) => {
                questionQuery.where('isActive', true).orderBy('sortOrder')
              })
              .preload('actions', (actionQuery) => {
                actionQuery.where('isActive', true).orderBy('sortOrder')
              })
              .preload('descriptions', (descQuery) => {
                descQuery.where('isActive', true).orderBy('sortOrder')
              })
          })
        })
        .preload('answers', (answerQuery) => {
          answerQuery.preload('question')
        })
        .first()

      if (!assessment) {
        return response.ok({
          data: {
            user: targetUser,
            assessment: null,
            message: 'No active assessment found for this user'
          }
        })
      }

      // Get competency scores for the assessment
      const scores = await assessment.getCompetencyScores()

      return response.ok({
        data: {
          user: targetUser,
          assessment,
          scores
        },
        message: 'User assessment retrieved successfully'
      })
    } catch (error: any) {
      console.error('Error fetching user assessment:', error)
      return response.status(500).json({ error: 'Failed to fetch user assessment' })
    }
  })
  
  // Simple auth - Roles Performance endpoints (temporary for testing)
  router.get('/simple-auth/roles-performance', async ({ request, response }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      
      // Find token in database
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default.from('auth_access_tokens').where('hash', token).first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }
      
      // Get roles
      const RolePerformance = await import('#models/role_performance')
      const roles = await RolePerformance.default.query()
        .where('isActive', true)
        .orderBy('sortOrder', 'asc')
        .select(['id', 'name', 'displayName', 'description', 'trainingTimeFrame', 'sortOrder'])

      return response.ok({
        success: true,
        data: roles
      })
    } catch (error: any) {
      console.error('Error fetching roles:', error)
      return response.status(500).json({ error: 'Failed to fetch roles' })
    }
  })

  router.get('/simple-auth/roles-performance/progress/overall', async ({ request, response }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default.from('auth_access_tokens').where('hash', token).first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }

      const User = await import('#models/user')
      const user = await User.default.find(tokenRecord.tokenable_id)
      if (!user) {
        return response.status(401).json({ error: 'User not found' })
      }

      // Use the controller logic
      const RolesPerformancesController = await import('#controllers/roles_performances_controller')
      const controller = new RolesPerformancesController.default()
      
      // Mock the HttpContext for the controller
      const mockContext = { auth: { user }, response }
      return await controller.getOverallProgress(mockContext as any)
      
    } catch (error: any) {
      console.error('Error fetching overall progress:', error)
      return response.status(500).json({ error: 'Failed to fetch overall progress' })
    }
  })

  router.get('/simple-auth/roles-performance/:id', async ({ request, response, params }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default.from('auth_access_tokens').where('hash', token).first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }

      // Use the controller logic
      const RolesPerformancesController = await import('#controllers/roles_performances_controller')
      const controller = new RolesPerformancesController.default()
      
      // Mock the HttpContext for the controller
      const mockContext = { params, response }
      return await controller.show(mockContext as any)
      
    } catch (error: any) {
      console.error('Error fetching role:', error)
      return response.status(500).json({ error: 'Failed to fetch role' })
    }
  })

  router.get('/simple-auth/roles-performance/:id/answers', async ({ request, response, params }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default.from('auth_access_tokens').where('hash', token).first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }

      const User = await import('#models/user')
      const user = await User.default.find(tokenRecord.tokenable_id)
      if (!user) {
        return response.status(401).json({ error: 'User not found' })
      }

      // Use the controller logic
      const RolesPerformancesController = await import('#controllers/roles_performances_controller')
      const controller = new RolesPerformancesController.default()
      
      // Mock the HttpContext for the controller
      const mockContext = { params, auth: { user }, response }
      return await controller.getUserAnswers(mockContext as any)
      
    } catch (error: any) {
      console.error('Error fetching answers:', error)
      return response.status(500).json({ error: 'Failed to fetch answers' })
    }
  })

  router.get('/simple-auth/roles-performance/:id/progress', async ({ request, response, params }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default.from('auth_access_tokens').where('hash', token).first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }

      const User = await import('#models/user')
      const user = await User.default.find(tokenRecord.tokenable_id)
      if (!user) {
        return response.status(401).json({ error: 'User not found' })
      }

      // Use the controller logic
      const RolesPerformancesController = await import('#controllers/roles_performances_controller')
      const controller = new RolesPerformancesController.default()
      
      // Mock the HttpContext for the controller
      const mockContext = { params, auth: { user }, response }
      return await controller.getUserProgress(mockContext as any)
      
    } catch (error: any) {
      console.error('Error fetching progress:', error)
      return response.status(500).json({ error: 'Failed to fetch progress' })
    }
  })

  router.post('/simple-auth/roles-performance/answer', async ({ request, response }) => {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'No Bearer token provided' })
      }
      
      const token = authHeader.substring(7)
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default.from('auth_access_tokens').where('hash', token).first()
      
      if (!tokenRecord) {
        return response.status(401).json({ error: 'Invalid token' })
      }

      const User = await import('#models/user')
      const user = await User.default.find(tokenRecord.tokenable_id)
      if (!user) {
        return response.status(401).json({ error: 'User not found' })
      }

      // Use the controller logic
      const RolesPerformancesController = await import('#controllers/roles_performances_controller')
      const controller = new RolesPerformancesController.default()
      
      // Mock the HttpContext for the controller
      const mockContext = { request, auth: { user }, response }
      return await controller.saveAnswer(mockContext as any)
      
    } catch (error: any) {
      console.error('Error saving answer:', error)
      return response.status(500).json({ error: 'Failed to save answer' })
    }
  })
  
  // IDP (Individual Development Plant) - Available for all authenticated users
  router
    .group(() => {
      // Get available roles
      router.get('/roles', '#controllers/idp_controller.getRoles')
      
      // Get role by user role (maps user.role to IDP role)
      router.get('/roles/:userRole', '#controllers/idp_controller.getRoleByUserRole')
      
      // Assessment management
      router.get('/assessment/current', '#controllers/idp_controller.getCurrentAssessment')
      router.get('/assessment/user/:userId', '#controllers/idp_controller.getUserAssessment')
      router.post('/assessment/answers', '#controllers/idp_controller.saveAnswers')
      router.post('/assessment/complete', '#controllers/idp_controller.completeAssessment')
      
      // Legacy endpoints (for backward compatibility)
      router.get('/', '#controllers/idp_controller.index')
      router.get('/:id', '#controllers/idp_controller.show')
    })
    .prefix('/idp')
    .use(middleware.auth())

  // Roles Performance endpoints (protected)
  router
    .group(() => {
      router.get('/', '#controllers/roles_performances_controller.index')
      router.get('/progress/overall', '#controllers/roles_performances_controller.getOverallProgress')
      router.get('/:id', '#controllers/roles_performances_controller.show')
      router.get('/:id/answers', '#controllers/roles_performances_controller.getUserAnswers')
      router.get('/:id/progress', '#controllers/roles_performances_controller.getUserProgress')
      router.post('/answer', '#controllers/roles_performances_controller.saveAnswer')
    })
    .prefix('/roles-performance')
    .use(middleware.auth())
  
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
