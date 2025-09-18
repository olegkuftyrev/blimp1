import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lead_relations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('lead_user_id').unsigned().references('users.id').onDelete('CASCADE').notNullable()
      table.integer('black_shirt_user_id').unsigned().references('users.id').onDelete('CASCADE').notNullable()
      table.unique(['lead_user_id', 'black_shirt_user_id'])
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
