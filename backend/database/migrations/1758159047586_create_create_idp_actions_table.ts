import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'idp_actions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('competency_id').unsigned().notNullable().references('id').inTable('idp_competencies').onDelete('CASCADE')
      table.string('action_id').notNullable() // e.g., "businessInsight-a1"
      table.text('action').notNullable() // The action description
      table.text('measurement').notNullable() // How to measure success
      table.string('start_date').nullable() // e.g., "1d", "7d", "28d"
      table.string('end_date').nullable() // e.g., "28d"
      table.json('responsible').nullable() // Array of responsible parties
      table.json('resources').nullable() // Array of resources
      table.integer('sort_order').defaultTo(0)
      table.boolean('is_active').defaultTo(true)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['competency_id'])
      table.index(['action_id'])
      table.index(['is_active'])
      table.index(['sort_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}