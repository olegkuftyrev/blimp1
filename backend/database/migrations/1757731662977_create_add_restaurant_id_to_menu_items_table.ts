import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'menu_items'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('restaurant_id').unsigned().references('id').inTable('restaurants').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('restaurant_id')
    })
  }
}