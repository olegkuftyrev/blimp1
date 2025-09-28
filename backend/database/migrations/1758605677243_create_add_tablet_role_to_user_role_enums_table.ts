import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
      // Check if role column exists before trying to modify it
    const hasRoleColumn = await this.schema.hasColumn(this.tableName, 'role')
    
    if (hasRoleColumn) {
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
    // If role column doesn't exist, it will be created in a later migration with the tablet role
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