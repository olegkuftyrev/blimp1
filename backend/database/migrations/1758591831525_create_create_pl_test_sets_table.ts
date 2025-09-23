import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pl_test_sets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('name').notNullable()
      table.text('description').notNullable()
      table.text('question_ids').notNullable() // JSON string of question IDs
      table.boolean('is_default').defaultTo(false)
      table.boolean('is_completed').defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['user_id', 'is_default'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}