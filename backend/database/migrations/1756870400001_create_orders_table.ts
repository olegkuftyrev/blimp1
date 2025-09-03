import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('table_section').notNullable()
      table.integer('menu_item_id').unsigned().references('id').inTable('menu_items').onDelete('CASCADE')
      table.integer('batch_size').notNullable()
      table.string('status').defaultTo('pending')
      table.timestamp('timer_start', { useTz: true }).nullable()
      table.timestamp('timer_end', { useTz: true }).nullable()
      table.timestamp('completed_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
