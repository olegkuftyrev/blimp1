import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'performance_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('performance_section_id').unsigned().references('id').inTable('performance_sections').onDelete('CASCADE')
      table.text('text').notNullable()
      table.text('description').nullable()
      table.integer('sort_order').defaultTo(0)
      table.string('global_question_id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index('global_question_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}