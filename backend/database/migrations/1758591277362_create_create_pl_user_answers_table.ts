import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pl_user_answers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('pl_question_id').unsigned().references('id').inTable('pl_questions').onDelete('CASCADE')
      table.string('user_answer').notNullable()
      table.boolean('is_correct').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['user_id', 'pl_question_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}