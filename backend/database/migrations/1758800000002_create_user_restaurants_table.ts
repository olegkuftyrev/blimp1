import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_restaurants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE').notNullable()
      table.integer('restaurant_id').unsigned().references('restaurants.id').onDelete('CASCADE').notNullable()
      table.integer('added_by_user_id').unsigned().references('users.id').onDelete('SET NULL').nullable()
      table.unique(['user_id', 'restaurant_id'])
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
