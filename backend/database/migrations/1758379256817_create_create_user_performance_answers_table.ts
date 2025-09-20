import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_performance_answers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('performance_item_id').unsigned().references('id').inTable('performance_items').onDelete('CASCADE')
      table.enum('answer', ['yes', 'no']).notNullable()
      table.string('global_question_id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['user_id', 'performance_item_id'])
      table.index(['user_id', 'global_question_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}