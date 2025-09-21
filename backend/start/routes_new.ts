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

// Protected user routes
router
  .group(() => {
    router.get('/', '#controllers/users_controller.index')
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
  })
  .prefix('/orders')
  .use(middleware.auth())

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
    router.post('/assessment/answers', '#controllers/idp_controller.saveAnswers')
    router.post('/assessment/complete', '#controllers/idp_controller.completeAssessment')
    router.post('/assessment/reset', '#controllers/idp_controller.resetAssessment')
  })
  .prefix('/idp')
  .use(middleware.auth())

// =============================================================================
// ROLES PERFORMANCE ROUTES (Protected)
// =============================================================================

router
  .group(() => {
    router.get('/', '#controllers/roles_performances_controller.index')
    router.get('/:id', '#controllers/roles_performances_controller.show')
    router.get('/:id/answers', '#controllers/roles_performances_controller.getAnswers')
    router.get('/:id/progress', '#controllers/roles_performances_controller.getProgress')
    router.post('/:roleId/answers', '#controllers/roles_performances_controller.saveAnswer')
  })
  .prefix('/roles-performance')
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
