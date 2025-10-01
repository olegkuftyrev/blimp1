import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'todo_checklist_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('todo_id').unsigned().references('todos.id').onDelete('CASCADE').notNullable()
      table.string('title').notNullable()
      table.boolean('is_done').notNullable().defaultTo(false)
      table.integer('sort_order').notNullable().defaultTo(0)
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['todo_id'])
      table.index(['sort_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}