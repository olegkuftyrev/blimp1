import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'idp_results'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('assessment_id').unsigned().notNullable()
      table.integer('competency_id').unsigned().notNullable()
      table.text('measurement').notNullable() // User's custom measurement text
      table.text('action_steps').notNullable() // User's custom action steps text
      table.text('responsible_resources').notNullable() // User's custom responsible/resources text
      table.string('start_date').nullable() // User's custom start date
      table.string('completion_date').nullable() // User's custom completion date
      table.enum('status', ['not_started', 'in_progress', 'completed', 'cancelled']).defaultTo('not_started')
      table.integer('progress').defaultTo(0) // Progress percentage (0-100)
      table.text('notes').nullable() // User's notes about the result
      table.boolean('is_active').defaultTo(true)
      table.timestamps(true, true)

      // Foreign key constraints
      table.foreign('assessment_id').references('id').inTable('idp_assessments').onDelete('CASCADE')
      table.foreign('competency_id').references('id').inTable('idp_competencies').onDelete('CASCADE')

      // Indexes for better performance
      table.index(['assessment_id', 'competency_id'])
      table.index(['assessment_id', 'is_active'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}