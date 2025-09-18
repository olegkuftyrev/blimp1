import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'idp_descriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('competency_id').unsigned().notNullable().references('id').inTable('idp_competencies').onDelete('CASCADE')
      table.enum('type', ['overview', 'definition', 'examples', 'behaviors']).notNullable()
      table.string('title').notNullable()
      table.text('content').notNullable()
      table.integer('sort_order').defaultTo(0)
      table.boolean('is_active').defaultTo(true)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['competency_id'])
      table.index(['type'])
      table.index(['is_active'])
      table.index(['sort_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}