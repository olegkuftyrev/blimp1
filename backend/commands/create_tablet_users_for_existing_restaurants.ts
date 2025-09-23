import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Database from '@adonisjs/lucid/services/db'

export default class CreateTabletUsersForExistingRestaurants extends BaseCommand {
  static commandName = 'create:tablet-users-for-existing-restaurants'
  static description = 'Create tablet users for existing restaurants that don\'t have them'

  static options: CommandOptions = {}

  async run() {
    this.logger.info('🔄 Creating tablet users for existing restaurants...')
    
    try {
      // Get all active restaurants
      const restaurants = await Database.from('restaurants').where('is_active', true)
      this.logger.info(`📊 Found ${restaurants.length} active restaurants`)
      
      let created = 0
      let skipped = 0
      
      for (const restaurant of restaurants) {
        // Extract restaurant identifier from name (e.g., "Panda Express PX2475" -> "px2475")
        const restaurantIdentifier = restaurant.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
          .replace(/pandaexpress/g, '') // Remove "pandaexpress" if present
          .trim()

        // Generate user credentials based on restaurant identifier
        const email = `${restaurantIdentifier}@pandarg.com`
        const password = `${restaurantIdentifier}${restaurantIdentifier}` // Double the identifier as password

        // Check if user already exists
        const existingUser = await Database.from('users').where('email', email).first()
        if (existingUser) {
          this.logger.info(`⏭️  Tablet user already exists for ${restaurant.name}: ${email}`)
          skipped++
          continue
        }

        // Create the tablet user
        const [userId] = await Database.table('users').insert({
          full_name: restaurantIdentifier,
          email: email,
          password: password, // Note: In production, this should be hashed
          role: 'tablet',
          job_title: 'Hourly Associate',
          created_at: new Date(),
          updated_at: new Date()
        })

        this.logger.info(`✅ Created tablet user for ${restaurant.name}: ${email}`)

        // Assign the user to the restaurant
        await Database.table('user_restaurants').insert({
          user_id: userId,
          restaurant_id: restaurant.id,
          added_by_user_id: 1, // Assuming admin user ID is 1, or you can make this configurable
          created_at: new Date(),
          updated_at: new Date()
        })

        created++
      }
      
      this.logger.info(`🎉 Completed! Created ${created} tablet users, skipped ${skipped} existing users`)
      
    } catch (error: any) {
      this.logger.error('❌ Error creating tablet users:', error.message)
      this.logger.error('❌ Full error:', error)
      console.error('Full error stack:', error.stack)
      process.exit(1)
    }
  }
}