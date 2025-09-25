import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pl_reports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('restaurant_id').unsigned().references('id').inTable('restaurants').onDelete('CASCADE')
      table.string('store_name').notNullable()
      table.string('company').notNullable()
      table.string('period').notNullable()
      table.string('translation_currency').defaultTo('USD')

      // Summary Financial Data (Current Period)
      table.decimal('net_sales', 15, 2).nullable()
      table.decimal('gross_sales', 15, 2).nullable()
      table.decimal('cost_of_goods_sold', 15, 2).nullable()
      table.decimal('total_labor', 15, 2).nullable()
      table.decimal('controllables', 15, 2).nullable()
      table.decimal('controllable_profit', 15, 2).nullable()
      table.decimal('advertising', 15, 2).nullable()
      table.decimal('fixed_costs', 15, 2).nullable()
      table.decimal('restaurant_contribution', 15, 2).nullable()
      table.decimal('cashflow', 15, 2).nullable()

      // Plan vs Actual Summary
      table.decimal('net_sales_plan', 15, 2).nullable()
      table.decimal('net_sales_vfp', 15, 2).nullable()
      table.decimal('net_sales_prior_year', 15, 2).nullable()
      table.decimal('cost_of_goods_sold_plan', 15, 2).nullable()
      table.decimal('cost_of_goods_sold_vfp', 15, 2).nullable()
      table.decimal('cost_of_goods_sold_prior_year', 15, 2).nullable()
      table.decimal('total_labor_plan', 15, 2).nullable()
      table.decimal('total_labor_vfp', 15, 2).nullable()
      table.decimal('total_labor_prior_year', 15, 2).nullable()

      // Performance Metrics
      table.integer('total_transactions').nullable()
      table.decimal('check_average', 10, 2).nullable()
      table.decimal('direct_labor_hours', 10, 2).nullable()
      table.decimal('average_hourly_wage', 10, 2).nullable()
      table.decimal('direct_hours_productivity', 10, 2).nullable()
      table.decimal('total_hours_productivity', 10, 2).nullable()
      table.integer('management_headcount').nullable()
      table.integer('assistant_manager_headcount').nullable()
      table.integer('chef_headcount').nullable()

      // Daypart Percentages
      table.decimal('breakfast_percentage', 5, 2).nullable()
      table.decimal('lunch_percentage', 5, 2).nullable()
      table.decimal('afternoon_percentage', 5, 2).nullable()
      table.decimal('evening_percentage', 5, 2).nullable()
      table.decimal('dinner_percentage', 5, 2).nullable()
      table.decimal('dine_in_percentage', 5, 2).nullable()
      table.decimal('take_out_percentage', 5, 2).nullable()
      table.decimal('drive_thru_percentage', 5, 2).nullable()
      table.decimal('third_party_digital_percentage', 5, 2).nullable()
      table.decimal('panda_digital_percentage', 5, 2).nullable()
      table.decimal('in_store_catering_percentage', 5, 2).nullable()

      // Sales Data
      table.decimal('catering_sales', 15, 2).nullable()
      table.decimal('panda_digital_sales', 15, 2).nullable()
      table.decimal('third_party_digital_sales', 15, 2).nullable()
      table.decimal('reward_redemptions', 15, 2).nullable()
      table.decimal('fundraising_events_sales', 15, 2).nullable()
      table.decimal('virtual_fundraising_sales', 15, 2).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      // Indexes
      table.index(['restaurant_id'])
      table.index(['period'])
      table.index(['store_name'])
      table.unique(['restaurant_id', 'period'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
