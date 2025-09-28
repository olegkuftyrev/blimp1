import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('role', ['admin', 'ops_lead', 'black_shirt', 'associate', 'tablet'], {
          useNative: false,
          enumName: 'user_role_enum',
          existingType: false,
        })
        .notNullable()
        .defaultTo('associate')

      table.dateTime('deleted_at').nullable().index()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
      table.dropColumn('deleted_at')
    })
  }
}
