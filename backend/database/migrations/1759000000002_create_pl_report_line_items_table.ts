import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pl_report_line_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('pl_report_id').unsigned().references('id').inTable('pl_reports').onDelete('CASCADE')
      table.string('category').nullable() // Sales, Cost of Sales, Labor, etc.
      table.string('subcategory').nullable() // Food Sales, Drink Sales, etc.
      table.string('ledger_account').notNullable()

      // Current Period Data
      table.decimal('actuals', 15, 2).nullable()
      table.decimal('actuals_percentage', 5, 2).nullable()
      table.decimal('plan', 15, 2).nullable()
      table.decimal('plan_percentage', 5, 2).nullable()
      table.decimal('vfp', 15, 2).nullable() // Variance from Plan
      table.decimal('prior_year', 15, 2).nullable()
      table.decimal('prior_year_percentage', 5, 2).nullable()

      // Year-to-Date Data
      table.decimal('actual_ytd', 15, 2).nullable()
      table.decimal('actual_ytd_percentage', 5, 2).nullable()
      table.decimal('plan_ytd', 15, 2).nullable()
      table.decimal('plan_ytd_percentage', 5, 2).nullable()
      table.decimal('vfp_ytd', 15, 2).nullable()
      table.decimal('prior_year_ytd', 15, 2).nullable()
      table.decimal('prior_year_ytd_percentage', 5, 2).nullable()

      table.integer('sort_order').defaultTo(0)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      // Indexes
      table.index(['pl_report_id'])
      table.index(['category'])
      table.index(['ledger_account'])
      table.index(['sort_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
