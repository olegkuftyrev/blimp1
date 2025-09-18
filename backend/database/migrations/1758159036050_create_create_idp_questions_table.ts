import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'idp_questions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('competency_id').unsigned().notNullable().references('id').inTable('idp_competencies').onDelete('CASCADE')
      table.string('question_id').notNullable() // e.g., "businessInsight-q1"
      table.text('question').notNullable() // The actual question text
      table.integer('sort_order').defaultTo(0)
      table.boolean('is_active').defaultTo(true)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['competency_id'])
      table.index(['question_id'])
      table.index(['is_active'])
      table.index(['sort_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}