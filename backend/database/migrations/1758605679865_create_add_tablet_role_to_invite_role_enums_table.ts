import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invitations'

  async up() {
    // Add 'tablet' to the invite role enum
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })
    
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('role', ['admin', 'ops_lead', 'black_shirt', 'associate', 'tablet'], {
          useNative: false,
          enumName: 'invite_role_enum',
          existingType: false,
        })
        .notNullable()
    })
  }

  async down() {
    // Remove 'tablet' from the invite role enum
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })
    
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('role', ['admin', 'ops_lead', 'black_shirt', 'associate'], {
          useNative: false,
          enumName: 'invite_role_enum',
          existingType: false,
        })
        .notNullable()
    })
  }
}