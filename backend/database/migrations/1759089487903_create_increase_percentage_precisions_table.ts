import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pl_report_line_items'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Increase precision for percentage columns to allow more decimal places
      table.decimal('actuals_percentage', 8, 6).alter()
      table.decimal('plan_percentage', 8, 6).alter()
      table.decimal('prior_year_percentage', 8, 6).alter()
      table.decimal('actual_ytd_percentage', 8, 6).alter()
      table.decimal('plan_ytd_percentage', 8, 6).alter()
      table.decimal('prior_year_ytd_percentage', 8, 6).alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revert back to original precision
      table.decimal('actuals_percentage', 5, 2).alter()
      table.decimal('plan_percentage', 5, 2).alter()
      table.decimal('prior_year_percentage', 5, 2).alter()
      table.decimal('actual_ytd_percentage', 5, 2).alter()
      table.decimal('plan_ytd_percentage', 5, 2).alter()
      table.decimal('prior_year_ytd_percentage', 5, 2).alter()
    })
  }
}