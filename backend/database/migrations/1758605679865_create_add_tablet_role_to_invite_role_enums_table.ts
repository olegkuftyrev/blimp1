import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invitations'

  async up() {
    // Check if invitations table and role column exist before trying to modify it
    const hasTable = await this.schema.hasTable(this.tableName)
    const hasRoleColumn = hasTable ? await this.schema.hasColumn(this.tableName, 'role') : false
    
    if (hasTable && hasRoleColumn) {
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
    // If table or role column doesn't exist, it will be created in a later migration with the tablet role
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