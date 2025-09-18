import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'restaurants'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('owner_user_id').unsigned().references('users.id').onDelete('SET NULL').nullable().index()
      table.dateTime('deleted_at').nullable().index()
      // Unique name constraint skipped to avoid migration failure on existing data
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('owner_user_id')
      table.dropColumn('deleted_at')
    })
  }
}
