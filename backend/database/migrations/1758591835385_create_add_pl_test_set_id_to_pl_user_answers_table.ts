import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pl_user_answers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('pl_test_set_id').unsigned().references('id').inTable('pl_test_sets').onDelete('CASCADE')
      
      // Drop the old unique constraint
      table.dropUnique(['user_id', 'pl_question_id'])
      
      // Add new unique constraint with test set
      table.unique(['user_id', 'pl_question_id', 'pl_test_set_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['user_id', 'pl_question_id', 'pl_test_set_id'])
      table.unique(['user_id', 'pl_question_id'])
      table.dropColumn('pl_test_set_id')
    })
  }
}