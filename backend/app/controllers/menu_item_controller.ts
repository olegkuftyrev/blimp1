import type { HttpContext } from '@adonisjs/core/http'
import MenuItem from '#models/menu_item'

export default class MenuItemController {
  /**
   * Display a list of all menu items
   */
  async index({ request, response }: HttpContext) {
    try {
      const restaurantId = request.input('restaurant_id', 1) // Default to restaurant 1
      const category = request.input('category') // Filter by category
      const steamTable = request.input('steam_table') // Filter by steam table status
      
      let query = MenuItem.query()
        .where('restaurantId', restaurantId)
        .where('status', 'available')
      
      // Apply category filter if provided
      if (category) {
        query = query.where('category', category)
      }
      
      // Apply steam table filter if provided
      if (steamTable !== undefined) {
        query = query.where('steam_table', steamTable === 'true')
      }
      
      let menuItems = await query
      
      // If no items found for this restaurant, show all available items (fallback)
      if (menuItems.length === 0) {
        let fallbackQuery = MenuItem.query().where('status', 'available')
        
        if (category) {
          fallbackQuery = fallbackQuery.where('category', category)
        }
        
        if (steamTable !== undefined) {
          fallbackQuery = fallbackQuery.where('steam_table', steamTable === 'true')
        }
        
        menuItems = await fallbackQuery
      }
      
      return response.json({
        data: menuItems
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to fetch menu items',
        message: error.message
      })
    }
  }

  /**
   * Display a single menu item
   */
  async show({ params, response }: HttpContext) {
    try {
      const menuItem = await MenuItem.findOrFail(params.id)
      return response.json({
        data: menuItem
      })
    } catch (error) {
      return response.status(404).json({
        error: 'Menu item not found',
        message: error.message
      })
    }
  }

  /**
   * Get all available categories
   */
  async categories({ response }: HttpContext) {
    try {
      const categories = await MenuItem.query()
        .select('category')
        .where('status', 'available')
        .groupBy('category')
        .orderBy('category')
      
      return response.json({
        data: categories.map(item => item.category)
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to fetch categories',
        message: error.message
      })
    }
  }

  /**
   * Update a menu item
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const menuItem = await MenuItem.findOrFail(params.id)
      
      const data = request.only([
        'itemTitle',
        'batchBreakfast',
        'batchLunch',
        'batchDowntime',
        'batchDinner',
        'cookingTimeBatch1',
        'cookingTimeBatch2',
        'cookingTimeBatch3',
        'status',
        'category',
        'steamTable'
      ])

      menuItem.merge(data)
      await menuItem.save()

      return response.json({
        data: menuItem
      })
    } catch (error) {
      return response.status(400).json({
        error: 'Failed to update menu item',
        message: error.message
      })
    }
  }

  /**
   * Delete a menu item
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const menuItem = await MenuItem.findOrFail(params.id)
      await menuItem.delete()
      
      return response.json({
        message: 'Menu item deleted successfully'
      })
    } catch (error) {
      return response.status(404).json({
        error: 'Menu item not found',
        message: error.message
      })
    }
  }
}
