import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'todos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('title').notNullable()
      table.text('description').nullable()

      table
        .enum('status', ['pending', 'in_progress', 'completed', 'cancelled'], {
          useNative: false,
          enumName: 'todo_status_enum',
          existingType: false,
        })
        .notNullable()
        .defaultTo('pending')

      table
        .enum('priority', ['low', 'medium', 'high'], {
          useNative: false,
          enumName: 'todo_priority_enum',
          existingType: false,
        })
        .notNullable()
        .defaultTo('medium')

      table
        .enum('scope', ['user', 'store', 'both'], {
          useNative: false,
          enumName: 'todo_scope_enum',
          existingType: false,
        })
        .notNullable()
        .defaultTo('user')

      table.timestamp('due_date', { useTz: true }).nullable()

      table.integer('user_id').unsigned().references('users.id').onDelete('SET NULL').nullable()
      table.integer('restaurant_id').unsigned().references('restaurants.id').onDelete('SET NULL').nullable()
      table.integer('assigned_user_id').unsigned().references('users.id').onDelete('SET NULL').nullable()

      table.integer('created_by_user_id').unsigned().references('users.id').onDelete('SET NULL').notNullable()
      table.integer('updated_by_user_id').unsigned().references('users.id').onDelete('SET NULL').nullable()

      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['status'])
      table.index(['priority'])
      table.index(['scope'])
      table.index(['user_id'])
      table.index(['restaurant_id'])
      table.index(['assigned_user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}