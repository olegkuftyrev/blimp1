/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

// Web routes
router.on('/').render('pages/home')

// API routes (without CSRF protection)
router.group(() => {
  // Restaurants
  router.get('/restaurants', '#controllers/restaurants_controller.index')
  router.get('/restaurants/:id', '#controllers/restaurants_controller.show')
  router.post('/restaurants', '#controllers/restaurants_controller.store')
  router.put('/restaurants/:id', '#controllers/restaurants_controller.update')
  router.delete('/restaurants/:id', '#controllers/restaurants_controller.destroy')

  // Menu Items
  router.get('/menu-items', '#controllers/menu_item_controller.index')
  router.get('/menu-items/:id', '#controllers/menu_item_controller.show')
  router.put('/menu-items/:id', '#controllers/menu_item_controller.update')

  // Orders
  router.get('/orders', '#controllers/order_controller.index')
  router.post('/orders', '#controllers/order_controller.store')
  router.get('/orders/:id', '#controllers/order_controller.show')
  router.put('/orders/:id', '#controllers/order_controller.update')
  router.delete('/orders/:id', '#controllers/order_controller.destroy')
  router.delete('/orders', '#controllers/order_controller.destroyAll')

  // Table Sections
  router.get('/table-sections', '#controllers/status_controller.tableSections')

  // Kitchen
  router.get('/kitchen/orders', '#controllers/kitchen_controller.orders')
  router.get('/kitchen/orders/pending', '#controllers/kitchen_controller.pendingOrders')
  router.get('/kitchen/orders/cooking', '#controllers/kitchen_controller.cookingOrders')
  router.post('/kitchen/orders/:id/start-timer', '#controllers/kitchen_controller.startTimer')
  router.post('/kitchen/orders/:id/cancel-timer', '#controllers/kitchen_controller.cancelTimer')
  router.post('/kitchen/orders/:id/extend-timer', '#controllers/kitchen_controller.extendTimer')
  router.get('/kitchen/orders/:id/timer-status', '#controllers/kitchen_controller.getTimerStatus')
  router.post('/kitchen/orders/:id/complete', '#controllers/kitchen_controller.complete')

  // System Status
  router.get('/status', '#controllers/status_controller.index')
  router.get('/status/table-sections', '#controllers/status_controller.tableSections')
  router.get('/status/kitchen', '#controllers/status_controller.kitchen')
}).prefix('/api')
