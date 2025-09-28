import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invitations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('code').notNullable().unique()
      table
        .enum('role', ['admin', 'ops_lead', 'black_shirt', 'associate', 'tablet'], {
          useNative: false,
          enumName: 'invite_role_enum',
          existingType: false,
        })
        .notNullable()
      table.integer('created_by_user_id').unsigned().references('users.id').onDelete('SET NULL').nullable()
      table.integer('restaurant_id').unsigned().references('restaurants.id').onDelete('SET NULL').nullable()
      table.timestamp('used_at', { useTz: true }).nullable()
      table.timestamp('expires_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
