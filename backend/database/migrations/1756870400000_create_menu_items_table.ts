import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'menu_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('item_title').notNullable()
      table.integer('batch_breakfast').notNullable()
      table.integer('batch_lunch').notNullable()
      table.integer('batch_downtime').notNullable()
      table.integer('batch_dinner').notNullable()
      table.integer('cooking_time_batch1').notNullable()
      table.integer('cooking_time_batch2').notNullable()
      table.integer('cooking_time_batch3').notNullable()
      table.string('status').defaultTo('available')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
