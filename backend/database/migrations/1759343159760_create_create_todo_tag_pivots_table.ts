import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'todo_tag_pivot'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('todo_id').unsigned().references('todos.id').onDelete('CASCADE').notNullable()
      table.integer('tag_id').unsigned().references('todo_tags.id').onDelete('CASCADE').notNullable()
      table.unique(['todo_id', 'tag_id'])
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}