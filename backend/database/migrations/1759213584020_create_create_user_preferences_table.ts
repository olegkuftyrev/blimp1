import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_preferences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('preference_key').notNullable()
      table.json('preference_value').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      // Ensure one preference per user per key
      table.unique(['user_id', 'preference_key'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}