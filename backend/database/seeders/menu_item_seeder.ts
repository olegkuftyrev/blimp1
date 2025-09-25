import { BaseSeeder } from '@adonisjs/lucid/seeders'
import MenuItem from '#models/menu_item'

export default class extends BaseSeeder {
  async run() {
    // Clear existing menu items
    await MenuItem.query().delete()
    
    // Create new menu items
    const menuItems = [
      // Appetizers
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
        category: 'Appetizers',
        steamTable: true
      },
      {
        itemTitle: 'E2 Chicken Egg Roll',
        batchBreakfast: 1,
        batchLunch: 3,
        batchDowntime: 2,
        batchDinner: 3,
        cookingTimeBatch1: 7,
        cookingTimeBatch2: 7,
        cookingTimeBatch3: 7,
        status: 'available',
        category: 'Appetizers',
        steamTable: true
      },
      {
        itemTitle: 'E3 Cream Cheese Rangoons',
        batchBreakfast: 1,
        batchLunch: 3,
        batchDowntime: 2,
        batchDinner: 3,
        cookingTimeBatch1: 3,
        cookingTimeBatch2: 3,
        cookingTimeBatch3: 3,
        status: 'available',
        category: 'Appetizers',
        steamTable: true
      },
      // Beef
      {
        itemTitle: 'B1 Broccoli Beef',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 1,
        cookingTimeBatch2: 1,
        cookingTimeBatch3: 1,
        status: 'available',
        category: 'Beef',
        steamTable: true
      },
      {
        itemTitle: 'B3 Black Pepper Sirloin Steak',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 2,
        cookingTimeBatch2: 2,
        cookingTimeBatch3: 2,
        status: 'available',
        category: 'Beef',
        steamTable: true
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
        category: 'Beef',
        steamTable: true
      },
      
      // Chicken
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
        category: 'Chicken',
        steamTable: true
      },
      {
        itemTitle: 'C2 Mushroom Chicken',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 1,
        cookingTimeBatch2: 2,
        cookingTimeBatch3: 2,
        status: 'available',
        category: 'Chicken',
        steamTable: true
      },
      {
        itemTitle: 'C3 Kung Pao Chicken',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 1,
        cookingTimeBatch2: 2,
        cookingTimeBatch3: 2,
        status: 'available',
        category: 'Chicken',
        steamTable: true
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
        category: 'Chicken',
        steamTable: true
      },
      {
        itemTitle: 'CB1 String Bean Chicken Breast',
        batchBreakfast: 1,
        batchLunch: 1,
        batchDowntime: 1,
        batchDinner: 1,
        cookingTimeBatch1: 1,
        cookingTimeBatch2: 1,
        cookingTimeBatch3: 1,
        status: 'available',
        category: 'Chicken',
        steamTable: true
      },
      {
        itemTitle: 'CB3 Honey Sesame Chicken Breast',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 3,
        cookingTimeBatch2: 3,
        cookingTimeBatch3: 3,
        status: 'available',
        category: 'Chicken',
        steamTable: true
      },
      
      // Seafood
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
        category: 'Seafood',
        steamTable: true
      },
      
      // Sides
      {
        itemTitle: 'M1 Show Mein',
        batchBreakfast: 1,
        batchLunch: 2,
        batchDowntime: 1,
        batchDinner: 2,
        cookingTimeBatch1: 7,
        cookingTimeBatch2: 7,
        cookingTimeBatch3: 7,
        status: 'available',
        category: 'Sides',
        steamTable: true
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
        category: 'Sides',
        steamTable: true
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
        category: 'Sides',
        steamTable: true
      },
      
      // Recipe Book Only Items (steamTable: false)
      {
        itemTitle: 'C9 Beyond Orange Chicken',
        batchBreakfast: 0,
        batchLunch: 0,
        batchDowntime: 0,
        batchDinner: 0,
        cookingTimeBatch1: 0,
        cookingTimeBatch2: 0,
        cookingTimeBatch3: 0,
        status: 'available',
        category: 'Chicken',
        steamTable: false
      },
      {
        itemTitle: 'Sweet Tea Brewing Procedures',
        batchBreakfast: 0,
        batchLunch: 0,
        batchDowntime: 0,
        batchDinner: 0,
        cookingTimeBatch1: 0,
        cookingTimeBatch2: 0,
        cookingTimeBatch3: 0,
        status: 'available',
        category: 'Beverages',
        steamTable: false
      },

      // Support Materials - PDF documents and reference charts
      {
        itemTitle: 'SM1 Cooking Sauce & Prep Chart',
        batchBreakfast: 0,
        batchLunch: 0,
        batchDowntime: 0,
        batchDinner: 0,
        cookingTimeBatch1: 0,
        cookingTimeBatch2: 0,
        cookingTimeBatch3: 0,
        status: 'available',
        category: 'Support Materials',
        steamTable: false
      },
      {
        itemTitle: 'SM2 Core Recipe Chart',
        batchBreakfast: 0,
        batchLunch: 0,
        batchDowntime: 0,
        batchDinner: 0,
        cookingTimeBatch1: 0,
        cookingTimeBatch2: 0,
        cookingTimeBatch3: 0,
        status: 'available',
        category: 'Support Materials',
        steamTable: false
      },
      {
        itemTitle: 'SM3 Crushed Red Chili Pepper',
        batchBreakfast: 0,
        batchLunch: 0,
        batchDowntime: 0,
        batchDinner: 0,
        cookingTimeBatch1: 0,
        cookingTimeBatch2: 0,
        cookingTimeBatch3: 0,
        status: 'available',
        category: 'Support Materials',
        steamTable: false
      },
      {
        itemTitle: 'SM4 Cutting Specifications (1 of 3)',
        batchBreakfast: 0,
        batchLunch: 0,
        batchDowntime: 0,
        batchDinner: 0,
        cookingTimeBatch1: 0,
        cookingTimeBatch2: 0,
        cookingTimeBatch3: 0,
        status: 'available',
        category: 'Support Materials',
        steamTable: false
      },
      {
        itemTitle: 'SM5 Deep Fry Chart',
        batchBreakfast: 0,
        batchLunch: 0,
        batchDowntime: 0,
        batchDinner: 0,
        cookingTimeBatch1: 0,
        cookingTimeBatch2: 0,
        cookingTimeBatch3: 0,
        status: 'available',
        category: 'Support Materials',
        steamTable: false
      },
      {
        itemTitle: 'SM6 Marinated Protein Cooking Chart',
        batchBreakfast: 0,
        batchLunch: 0,
        batchDowntime: 0,
        batchDinner: 0,
        cookingTimeBatch1: 0,
        cookingTimeBatch2: 0,
        cookingTimeBatch3: 0,
        status: 'available',
        category: 'Support Materials',
        steamTable: false
      },
      {
        itemTitle: 'SM7 Marinated Protein Quality Chart',
        batchBreakfast: 0,
        batchLunch: 0,
        batchDowntime: 0,
        batchDinner: 0,
        cookingTimeBatch1: 0,
        cookingTimeBatch2: 0,
        cookingTimeBatch3: 0,
        status: 'available',
        category: 'Support Materials',
        steamTable: false
      },
      {
        itemTitle: 'SM8 PCB 2025 Q1',
        batchBreakfast: 0,
        batchLunch: 0,
        batchDowntime: 0,
        batchDinner: 0,
        cookingTimeBatch1: 0,
        cookingTimeBatch2: 0,
        cookingTimeBatch3: 0,
        status: 'available',
        category: 'Support Materials',
        steamTable: false
      },
      {
        itemTitle: 'SM9 Side Recipe Chart',
        batchBreakfast: 0,
        batchLunch: 0,
        batchDowntime: 0,
        batchDinner: 0,
        cookingTimeBatch1: 0,
        cookingTimeBatch2: 0,
        cookingTimeBatch3: 0,
        status: 'available',
        category: 'Support Materials',
        steamTable: false
      }

    ]
    
    // Insert menu items
    for (const item of menuItems) {
      await MenuItem.create(item)
    }
    
    console.log('✅ Menu items seeded successfully!')
  }
}