import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audit_log'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('actor_user_id').unsigned().references('users.id').onDelete('SET NULL').nullable()
      table.string('action').notNullable()
      table.string('entity_type').notNullable()
      table.integer('entity_id').unsigned().nullable()
      table.json('payload').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
