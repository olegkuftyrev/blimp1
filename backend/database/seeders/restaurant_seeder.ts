import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Restaurant from '#models/restaurant'

export default class extends BaseSeeder {
  async run() {
    console.log('🔄 Starting restaurant seeder...')
    
    try {
      // Check if restaurants already exist to avoid duplicate key errors
      console.log('📊 Checking existing restaurants...')
      const existingCount = await Restaurant.query().count('* as total')
      const count = existingCount[0].$extras.total
      console.log(`📈 Found ${count} existing restaurants`)

      if (count > 0) {
        console.log('✅ Restaurants already exist, skipping seeding')
        return
      }

      // Create default restaurants
      console.log('🏗️ Creating new restaurants...')
      const restaurants = [
        {
          name: 'Panda Express PX2874',
          address: '123 Main Street, Downtown',
          phone: '(555) 123-4567',
          isActive: true
        },
        {
          name: 'Panda Express PX3698',
          address: '456 Oak Avenue, Midtown',
          phone: '(555) 234-5678',
          isActive: true
        },
        {
          name: 'Panda Express PX2475',
          address: '789 Pine Road, Uptown',
          phone: '(555) 345-6789',
          isActive: true
        }
      ]

      console.log(`📝 Inserting ${restaurants.length} restaurants one by one...`)
      for (const restaurant of restaurants) {
        console.log(`🏪 Creating restaurant: ${restaurant.name}`)
        await Restaurant.create(restaurant)
        console.log(`✅ Created: ${restaurant.name}`)
      }
      console.log('✅ All restaurants seeded successfully!')
      
    } catch (error) {
      console.error('❌ Error in restaurant seeder:', error)
      throw error
    }
  }
}