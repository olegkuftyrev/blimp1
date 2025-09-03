import type { HttpContext } from '@adonisjs/core/http'
import MenuItem from '#models/menu_item'

export default class MenuItemController {
  /**
   * Display a list of all menu items
   */
  async index({ response }: HttpContext) {
    try {
      const menuItems = await MenuItem.all()
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
        'status'
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
}
