import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    // Add 'tablet' to the user role enum
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })
    
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('role', ['admin', 'ops_lead', 'black_shirt', 'associate', 'tablet'], {
          useNative: false,
          enumName: 'user_role_enum',
          existingType: false,
        })
        .notNullable()
        .defaultTo('associate')
    })
  }

  async down() {
    // Remove 'tablet' from the user role enum
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })
    
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('role', ['admin', 'ops_lead', 'black_shirt', 'associate'], {
          useNative: false,
          enumName: 'user_role_enum',
          existingType: false,
        })
        .notNullable()
        .defaultTo('associate')
    })
  }
}