import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Restaurant from '#models/restaurant'

export default class extends BaseSeeder {
  async run() {
    // Create default restaurants
    await Restaurant.createMany([
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
    ])
  }
}