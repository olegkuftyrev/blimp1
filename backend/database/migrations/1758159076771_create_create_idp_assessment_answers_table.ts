import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'idp_assessment_answers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('assessment_id').unsigned().notNullable().references('id').inTable('idp_assessments').onDelete('CASCADE')
      table.integer('question_id').unsigned().notNullable().references('id').inTable('idp_questions').onDelete('CASCADE')
      table.enum('answer', ['yes', 'no']).notNullable() // The user's answer

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['assessment_id'])
      table.index(['question_id'])
      
      // Unique constraint: one answer per question per assessment
      table.unique(['assessment_id', 'question_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}