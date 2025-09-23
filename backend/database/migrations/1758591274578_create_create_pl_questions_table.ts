import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pl_questions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('question_id').unique().notNullable()
      table.text('label').notNullable()
      table.text('explanation').notNullable()
      table.string('formula').notNullable()
      table.string('a1').notNullable()
      table.string('a2').notNullable()
      table.string('a3').notNullable()
      table.string('a4').notNullable()
      table.string('correct_answer').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}