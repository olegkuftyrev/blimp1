import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MenuItem from '#models/menu_item'

export default class extends BaseSeeder {
  async run() {
    // Clear existing menu items
    await MenuItem.query().delete()
    
    // Create new menu items
    const menuItems = [
      {
        itemTitle: 'E2 Chicken Egg Roll',
        batchBreakfast: 1,
        batchLunch: 3,
        batchDowntime: 2,
        batchDinner: 3,
        cookingTimeBatch1: 7.0,
        cookingTimeBatch2: 7.0,
        cookingTimeBatch3: 7.0,
        status: 'available'
      },
      {
        itemTitle: 'E3 Cream Cheese Rangoons',
        batchBreakfast: 1,
        batchLunch: 3,
        batchDowntime: 2,
        batchDinner: 3,
        cookingTimeBatch1: 2.5,
        cookingTimeBatch2: 2.5,
        cookingTimeBatch3: 2.5,
        status: 'available'
      },
      {
        itemTitle: 'E1 Veggie Spring Rolls',
        batchBreakfast: 1,
        batchLunch: 3,
        batchDowntime: 2,
        batchDinner: 3,
        cookingTimeBatch1: 5,
        cookingTimeBatch2: 5,
        cookingTimeBatch3: 5,
        status: 'available'
      },
      {
        itemTitle: 'B5 Beijing Beef',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 5,
        cookingTimeBatch2: 5,
        cookingTimeBatch3: 5,
        status: 'available'
      },
      {
        itemTitle: 'B3 Black Pepper Sirloin Steak',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 1.5,
        cookingTimeBatch2: 1.75,
        cookingTimeBatch3: 2.0,
        status: 'available'
      },
      {
        itemTitle: 'B1 Broccoli Beef',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 0.75,
        cookingTimeBatch2: 1.0,
        cookingTimeBatch3: 1.25,
        status: 'available'
      },
      {
        itemTitle: 'C4 Grilled Teriyaki Chicken',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 7,
        cookingTimeBatch2: 7,
        cookingTimeBatch3: 7,
        status: 'available'
      },
      {
        itemTitle: 'CB3 Honey Sesame Chicken Breast',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 2.5,
        cookingTimeBatch2: 2.5,
        cookingTimeBatch3: 2.5,
        status: 'available'
      },
      {
        itemTitle: 'C3 Kung Pao Chicken',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 1.25,
        cookingTimeBatch2: 1.5,
        cookingTimeBatch3: 1.75,
        status: 'available'
      },
      {
        itemTitle: 'C2 Mushroom Chicken',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 1.25,
        cookingTimeBatch2: 1.5,
        cookingTimeBatch3: 1.75,
        status: 'available'
      },
      {
        itemTitle: 'C1 Orange Chicken',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 8,
        cookingTimeBatch2: 8,
        cookingTimeBatch3: 8,
        status: 'available'
      },
      {
        itemTitle: 'CB1 String Bean Chicken Breast',
        batchBreakfast: 1,
        batchLunch: 1,
        batchDowntime: 1,
        batchDinner: 1,
        cookingTimeBatch1: 0.75,
        cookingTimeBatch2: 1.0,
        cookingTimeBatch3: 1.25,
        status: 'available'
      },
      {
        itemTitle: 'F4 Honey Walnut Shrimp',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 3,
        cookingTimeBatch2: 3,
        cookingTimeBatch3: 3,
        status: 'available'
      },
      {
        itemTitle: 'M1 Show Mein',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 7,
        cookingTimeBatch2: 7,
        cookingTimeBatch3: 7,
        status: 'available'
      },
      {
        itemTitle: 'R1 Fried Rice',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 7,
        cookingTimeBatch2: 7,
        cookingTimeBatch3: 7,
        status: 'available'
      },
      {
        itemTitle: 'V1 Super Greens',
        batchBreakfast: 1,
        batchLunch: 1,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 3,
        cookingTimeBatch2: 3,
        cookingTimeBatch3: 3,
        status: 'available'
      },

    ]
    
    // Insert menu items
    for (const item of menuItems) {
      await MenuItem.create(item)
    }
    
    console.log('✅ Menu items seeded successfully!')
  }
}