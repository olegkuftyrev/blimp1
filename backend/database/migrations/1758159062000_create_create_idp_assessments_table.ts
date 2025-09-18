import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'idp_assessments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('role_id').unsigned().notNullable().references('id').inTable('idp_roles').onDelete('CASCADE')
      table.integer('version').defaultTo(1) // For versioning assessments
      table.enum('status', ['draft', 'in_progress', 'completed']).defaultTo('draft')
      table.boolean('is_active').defaultTo(true) // Only one active assessment per user
      table.timestamp('started_at').nullable()
      table.timestamp('completed_at').nullable()
      table.timestamp('deleted_at').nullable() // Soft delete

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Indexes
      table.index(['user_id'])
      table.index(['role_id'])
      table.index(['status'])
      table.index(['is_active'])
      table.index(['deleted_at'])
      
      // Note: Unique constraint for active assessments will be handled at application level
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}