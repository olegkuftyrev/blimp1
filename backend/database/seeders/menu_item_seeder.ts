import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MenuItem from '#models/menu_item'

export default class extends BaseSeeder {
  async run() {
    // Clear existing menu items
    await MenuItem.query().delete()
    
    // Create 4 Panda Express dishes with random cooking times (2-5 minutes)
    const menuItems = [
      {
        itemTitle: 'Fried Rice',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 3,
        cookingTimeBatch1: Math.floor(Math.random() * 3) + 2, // 2-4 minutes
        cookingTimeBatch2: Math.floor(Math.random() * 3) + 2, // 2-4 minutes
        cookingTimeBatch3: Math.floor(Math.random() * 3) + 2, // 2-4 minutes
        status: 'available'
      },
      {
        itemTitle: 'Orange Chicken',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 3,
        cookingTimeBatch1: Math.floor(Math.random() * 3) + 2, // 2-4 minutes
        cookingTimeBatch2: Math.floor(Math.random() * 3) + 2, // 2-4 minutes
        cookingTimeBatch3: Math.floor(Math.random() * 3) + 2, // 2-4 minutes
        status: 'available'
      },
      {
        itemTitle: 'Cream Cheese Ragoons',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 3,
        cookingTimeBatch1: Math.floor(Math.random() * 3) + 2, // 2-4 minutes
        cookingTimeBatch2: Math.floor(Math.random() * 3) + 2, // 2-4 minutes
        cookingTimeBatch3: Math.floor(Math.random() * 3) + 2, // 2-4 minutes
        status: 'available'
      },
      {
        itemTitle: 'Honey Walnut Shrimp',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 3,
        cookingTimeBatch1: Math.floor(Math.random() * 3) + 2, // 2-4 minutes
        cookingTimeBatch2: Math.floor(Math.random() * 3) + 2, // 2-4 minutes
        cookingTimeBatch3: Math.floor(Math.random() * 3) + 2, // 2-4 minutes
        status: 'available'
      }
    ]
    
    // Insert menu items
    for (const item of menuItems) {
      await MenuItem.create(item)
    }
    
    console.log('✅ Menu items seeded successfully!')
  }
}