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

// =============================================================================
// GLOBAL API PREFIX
// =============================================================================

// All API routes are prefixed with /api
router.group(() => {

// =============================================================================
// AUTHENTICATION ROUTES (No middleware required)
// =============================================================================

// Authentication endpoints
router.post('/auth/sign-in', '#controllers/auth_controller.login')
router.post('/auth/register-by-invite', '#controllers/auth_controller.registerByInvite')

// Protected authentication routes
router.post('/auth/logout', '#controllers/auth_controller.logout').use(middleware.auth())
router.get('/auth/me', '#controllers/auth_controller.me').use(middleware.auth())
router.put('/auth/profile', '#controllers/auth_controller.updateProfile').use(middleware.auth())

// =============================================================================
// INVITATION ROUTES (Protected)
// =============================================================================

router.post('/invites', '#controllers/invites_controller.create').use(middleware.auth())

// =============================================================================
// USER ROUTES (Protected)
// =============================================================================

// Debug endpoint (no auth middleware)
router.get('/users/debug', '#controllers/users_controller.debug')

// Test endpoint (no auth middleware)
router.get('/users/test', '#controllers/users_controller.testUsers')

// Temporary debug endpoint for team members (no auth middleware)
router.get('/users/team-debug', '#controllers/users_controller.getTeamMembers')

// Protected user routes
router
  .group(() => {
    router.get('/', '#controllers/users_controller.index')
    router.get('/team', '#controllers/users_controller.getTeamMembers')
    router.post('/', '#controllers/users_controller.store')
    router.get('/:id', '#controllers/users_controller.show')
    router.put('/:id', '#controllers/users_controller.update')
    router.delete('/:id', '#controllers/users_controller.destroy')
  })
  .prefix('/users')
  .use(middleware.auth())

// =============================================================================
// RESTAURANT ROUTES (Protected)
// =============================================================================

router
  .group(() => {
    router.get('/', '#controllers/restaurants_controller.index')
    router.get('/:id', '#controllers/restaurants_controller.show')
    router.post('/', '#controllers/restaurants_controller.store')
    router.put('/:id', '#controllers/restaurants_controller.update')
    router.delete('/:id', '#controllers/restaurants_controller.destroy')
  })
  .prefix('/restaurants')
  .use(middleware.auth())

// =============================================================================
// MENU ITEM ROUTES (Protected)
// =============================================================================

router
  .group(() => {
    router.get('/', '#controllers/menu_item_controller.index')
    router.get('/categories', '#controllers/menu_item_controller.categories')
    router.get('/:id', '#controllers/menu_item_controller.show')
    router.post('/', '#controllers/menu_item_controller.store')
    router.put('/:id', '#controllers/menu_item_controller.update')
    router.delete('/:id', '#controllers/menu_item_controller.destroy')
  })
  .prefix('/menu-items')
  .use(middleware.auth())

// =============================================================================
// ORDER ROUTES (Protected)
// =============================================================================

router
  .group(() => {
    router.get('/', '#controllers/order_controller.index')
    router.get('/:id', '#controllers/order_controller.show')
    router.post('/', '#controllers/order_controller.store')
    router.put('/:id', '#controllers/order_controller.update')
    router.delete('/:id', '#controllers/order_controller.destroy')
    router.post('/:id/start-timer', '#controllers/order_controller.startTimer')
    router.post('/:id/complete', '#controllers/order_controller.complete')
    router.post('/:id/add-time', '#controllers/order_controller.addTime')
  })
  .prefix('/orders')
  .use(middleware.auth())

// =============================================================================
// ORDERS HISTORY (Protected)
// =============================================================================

router.get('/orders-history', '#controllers/order_controller.history').use(middleware.auth())

// =============================================================================
// KITCHEN ROUTES (Protected)
// =============================================================================

router
  .group(() => {
    router.get('/', '#controllers/kitchen_controller.index')
    router.get('/orders', '#controllers/kitchen_controller.orders')
    router.get('/orders/:id', '#controllers/kitchen_controller.showOrder')
    router.post('/orders/:id/start-timer', '#controllers/kitchen_controller.startTimer')
    router.post('/orders/:id/complete', '#controllers/kitchen_controller.complete')
    router.delete('/orders/:id', '#controllers/kitchen_controller.destroy')
    router.get('/history', '#controllers/kitchen_controller.history')
  })
  .prefix('/kitchen')
  .use(middleware.auth())

// =============================================================================
// STATUS ROUTES (Protected)
// =============================================================================

router.get('/status', '#controllers/status_controller.index').use(middleware.auth())
router.get('/status/table-sections', '#controllers/status_controller.tableSections').use(middleware.auth())
router.get('/status/kitchen', '#controllers/status_controller.kitchen').use(middleware.auth())
router.get('/table-sections', '#controllers/status_controller.tableSections').use(middleware.auth())

// =============================================================================
// IDP ROUTES (Protected)
// =============================================================================

router
  .group(() => {
    router.get('/roles', '#controllers/idp_controller.getRoles')
    router.get('/role/current', '#controllers/idp_controller.getCurrentRole')
    router.get('/roles/:userRole', '#controllers/idp_controller.getRoleByUserRole')
    router.get('/assessment/current', '#controllers/idp_controller.getCurrentAssessment')
    router.get('/assessment/user/:userId', '#controllers/idp_controller.getUserAssessment')
    router.post('/assessment/answers', '#controllers/idp_controller.saveAnswers')
    router.post('/assessment/complete', '#controllers/idp_controller.completeAssessment')
    router.post('/assessment/reset', '#controllers/idp_controller.resetAssessment')
    
    // Development plan endpoints
    router.get('/development-plan', '#controllers/idp_controller.getDevelopmentPlan')
    router.post('/development-plan', '#controllers/idp_controller.saveDevelopmentPlan')
    router.delete('/development-plan/:id', '#controllers/idp_controller.deleteDevelopmentPlanItem')
    
    // Results endpoints
    router.get('/results', '#controllers/idp_controller.getResults')
    router.post('/results', '#controllers/idp_controller.saveResult')
    router.delete('/results/:id', '#controllers/idp_controller.deleteResult')
  })
  .prefix('/idp')
  .use(middleware.auth())

// =============================================================================
// ROLES PERFORMANCE ROUTES (Protected)
// =============================================================================

router
  .group(() => {
    router.get('/', '#controllers/roles_performances_controller.index')
    router.get('/progress/overall', '#controllers/roles_performances_controller.getOverallProgress')
    router.get('/:id', '#controllers/roles_performances_controller.show')
    router.get('/:id/answers', '#controllers/roles_performances_controller.getUserAnswers')
    router.get('/:id/progress', '#controllers/roles_performances_controller.getUserProgress')
    router.post('/:roleId/answers', '#controllers/roles_performances_controller.saveAnswer')
    router.post('/:roleId/answers/bulk', '#controllers/roles_performances_controller.saveAnswersBulk')
  })
  .prefix('/roles-performance')
  .use(middleware.auth())

// =============================================================================
// P&L PRACTICE TESTS ROUTES (Protected)
// =============================================================================

router
  .group(() => {
    // Test sets management
    router.get('/test-sets', '#controllers/pl_questions_controller.getTestSets')
    router.post('/test-sets', '#controllers/pl_questions_controller.createTestSet')
    router.get('/test-sets/:id', '#controllers/pl_questions_controller.getTestSet')
    
    // Questions and answers
    router.get('/stats', '#controllers/pl_questions_controller.getStats')
    router.post('/:id/answer', '#controllers/pl_questions_controller.submitAnswer')
    
    // Admin only routes
    router.post('/test-sets/:testSetId/reset', '#controllers/pl_questions_controller.resetTestSet')
    router.post('/test-sets/:testSetId/fill-random', '#controllers/pl_questions_controller.fillRandomAnswers')
    router.post('/test-sets/:testSetId/fill-correct', '#controllers/pl_questions_controller.fillCorrectAnswers')
    router.delete('/test-sets', '#controllers/pl_questions_controller.deleteAllTestSets')
    
    // Admin routes for viewing other users' data
    router.get('/users/:userId/test-sets', '#controllers/pl_questions_controller.getTestSetsForUser')
    router.get('/users/:userId/stats', '#controllers/pl_questions_controller.getStatsForUser')
  })
  .prefix('/pl-questions')
  .use(middleware.auth())

// =============================================================================
// P&L REPORT ROUTES (Protected)
// =============================================================================

router
  .group(() => {
      router.post('/upload', '#controllers/pl_report_controller.upload')
      router.get('/', '#controllers/pl_report_controller.index')
      router.get('/:id', '#controllers/pl_report_controller.show')
      router.get('/:id/line-items', '#controllers/pl_report_controller.lineItems')
      router.get('/:id/raw-data', '#controllers/pl_report_controller.getRawData')
      router.delete('/:id', '#controllers/pl_report_controller.destroy')
  })
  .prefix('/pl-reports')
  .use(middleware.auth())

// =============================================================================
// PERIODS ROUTES (Protected)
// =============================================================================

router
  .group(() => {
    router.get('/', '#controllers/periods_controller.index')
    router.get('/current', '#controllers/periods_controller.current')
  })
  .prefix('/periods')
  .use(middleware.auth())

// =============================================================================
// AREA P&L ROUTES (Protected - admin and ops_lead via policy)
// =============================================================================

router
  .group(() => {
    // Backward-compatible index (placeholder)
    router.get('/', '#controllers/area_pl_controller.index')

    // Area P&L analytics endpoints (GET only)
    router.get('/summary', '#controllers/area_pl_controller.summary')
    router.get('/breakdown', '#controllers/area_pl_controller.breakdown')
    router.get('/trends', '#controllers/area_pl_controller.trends')
    router.get('/variance', '#controllers/area_pl_controller.variance')
    router.get('/leaderboard', '#controllers/area_pl_controller.leaderboard')
    router.get('/line-items', '#controllers/area_pl_controller.lineItems')
    router.get('/periods', '#controllers/area_pl_controller.periods')
    router.get('/kpis', '#controllers/area_pl_controller.kpis')
    router.get('/compare', '#controllers/area_pl_controller.compare')
  })
  .prefix('/area-pl')
  .use(middleware.auth())

// =============================================================================
// DEBUG ROUTES (Protected)
// =============================================================================

// Debug endpoint for authentication testing
router.get('/debug/auth', ({ auth, response }) => {
  return response.json({
    authenticated: auth.isAuthenticated,
    user: auth.user ? {
      id: auth.user.id,
      email: auth.user.email,
      role: auth.user.role
    } : null
  })
}).use(middleware.auth())

// Manual token test endpoint
router.get('/debug/manual-auth', async ({ request, response }) => {
  const authHeader = request.header('authorization')
  return response.json({
    hasAuthHeader: !!authHeader,
    authHeader: authHeader ? authHeader.substring(0, 20) + '...' : null,
    message: 'Manual auth test endpoint'
  })
})

// Test WebSocket timer expired event
router.post('/debug/test-timer-sound', async ({ request, response }) => {
  const { orderId } = request.only(['orderId'])
  
  if (!orderId) {
    return response.badRequest({ error: 'orderId is required' })
  }
  
  try {
    const WebSocketService = (await import('#services/websocket_service')).default
    const Order = (await import('#models/order')).default
    
    const order = await Order.find(orderId)
    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }
    
    await order.load('menuItem')
    
    const wsService = new WebSocketService()
    wsService.emitTimerExpired(order)
    
    return response.ok({
      message: 'Timer expired event sent',
      orderId: order.id,
      orderStatus: order.status
    })
  } catch (error) {
    return response.internalServerError({
      error: 'Failed to send timer event',
      message: error.message
    })
  }
}).use(middleware.auth())

// Close the global API prefix group
}).prefix('/api')

