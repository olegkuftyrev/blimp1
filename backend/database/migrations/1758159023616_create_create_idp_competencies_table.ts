import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'idp_competencies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('role_id').unsigned().notNullable().references('id').inTable('idp_roles').onDelete('CASCADE')
      table.string('competency_id').notNullable() // e.g., "businessInsight"
      table.string('label').notNullable() // e.g., "Business Insight"
      table.text('description').nullable()
      table.integer('sort_order').defaultTo(0)
      table.boolean('is_active').defaultTo(true)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['role_id'])
      table.index(['competency_id'])
      table.index(['is_active'])
      table.index(['sort_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}