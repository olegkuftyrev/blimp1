import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MenuItem from '#models/menu_item'
import Restaurant from '#models/restaurant'

export default class extends BaseSeeder {
  async run() {
    // Get first restaurant
    const restaurant = await Restaurant.query().first()
    
    if (!restaurant) {
      console.log('⚠️  No restaurant found. Please create a restaurant first.')
      return
    }
    
    console.log(`📝 Seeding menu items for restaurant: ${restaurant.name}`)
    
    // Clear existing menu items for this restaurant
    await MenuItem.query().where('restaurant_id', restaurant.id).delete()
    
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'appetizer',
        steamTable: null
      },
      {
        itemTitle: 'test',
        batchBreakfast: 1,
        batchLunch: 0.5,
        batchDowntime: 2,
        batchDinner: 4,
        cookingTimeBatch1: 0.1,
        cookingTimeBatch2: 0.5,
        cookingTimeBatch3: 1.0,
        status: 'available',
        restaurantId: restaurant.id,
        category: null,
        steamTable: null
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'appetizer',
        steamTable: null
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'appetizer',
        steamTable: null
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'beef',
        steamTable: 'hot'
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'beef',
        steamTable: 'hot'
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'beef',
        steamTable: 'hot'
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'chicken',
        steamTable: 'hot'
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'chicken',
        steamTable: 'hot'
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'chicken',
        steamTable: 'hot'
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'chicken',
        steamTable: 'hot'
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'chicken',
        steamTable: 'hot'
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'chicken',
        steamTable: 'hot'
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'seafood',
        steamTable: 'hot'
      },
      {
        itemTitle: 'M1 Chow Mein',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 7,
        cookingTimeBatch2: 7,
        cookingTimeBatch3: 7,
        status: 'available',
        restaurantId: restaurant.id,
        category: 'side',
        steamTable: 'cold'
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'side',
        steamTable: 'cold'
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
        status: 'available',
        restaurantId: restaurant.id,
        category: 'vegetable',
        steamTable: 'hot'
      },
    ]
    
    // Insert menu items
    for (const item of menuItems) {
      await MenuItem.create(item)
    }
    
    console.log(`✅ Successfully seeded ${menuItems.length} menu items for ${restaurant.name}!`)
  }
}

