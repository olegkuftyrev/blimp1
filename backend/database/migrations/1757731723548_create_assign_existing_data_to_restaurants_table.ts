import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'assign_existing_data_to_restaurants'

  async up() {
    // Assign all existing menu items to the first restaurant (PX2874)
    this.defer(async (db) => {
      await db.rawQuery('UPDATE menu_items SET restaurant_id = 1 WHERE restaurant_id IS NULL')
      await db.rawQuery('UPDATE orders SET restaurant_id = 1 WHERE restaurant_id IS NULL')
    })
  }

  async down() {
    // This migration cannot be easily reversed
  }
}