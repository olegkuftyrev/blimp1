import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'idp_development_plans'

  async up() {
    // Skip this migration - constraint doesn't exist in the table definition
    // The constraint was never added in the first place
    console.log('Skipping constraint removal - constraint does not exist')
  }

  async down() {
    // Re-add the unique constraint
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['assessment_id', 'competency_id'])
    })
  }
}