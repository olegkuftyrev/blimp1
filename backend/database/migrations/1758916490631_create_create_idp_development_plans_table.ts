import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'idp_development_plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('assessment_id').unsigned().notNullable().references('id').inTable('idp_assessments').onDelete('CASCADE')
      table.integer('competency_id').unsigned().notNullable().references('id').inTable('idp_competencies').onDelete('CASCADE')
      table.text('measurement').notNullable() // User's custom measurement
      table.text('action_steps').notNullable() // User's custom action steps
      table.text('responsible_resources').notNullable() // User's custom responsible/resources
      table.string('start_date').nullable() // User's custom start date
      table.string('completion_date').nullable() // User's custom completion date
      table.boolean('is_active').defaultTo(true)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['assessment_id'])
      table.index(['competency_id'])
      table.index(['is_active'])
      table.index(['assessment_id', 'competency_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}