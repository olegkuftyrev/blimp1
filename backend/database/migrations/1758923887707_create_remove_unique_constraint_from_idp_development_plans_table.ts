import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'idp_development_plans'

  async up() {
    // Remove the unique constraint that prevents multiple measurements per competency
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['assessment_id', 'competency_id'])
    })
  }

  async down() {
    // Re-add the unique constraint
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['assessment_id', 'competency_id'])
    })
  }
}