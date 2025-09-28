import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pl_reports'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Net Sales additional columns
      table.decimal('net_sales_actual_ytd', 15, 2).defaultTo(0)
      table.decimal('net_sales_plan_ytd', 15, 2).defaultTo(0)
      table.decimal('net_sales_vfp_ytd', 15, 2).defaultTo(0)
      table.decimal('net_sales_prior_year_ytd', 15, 2).defaultTo(0)

      // Gross Sales additional columns
      table.decimal('gross_sales_plan', 15, 2).defaultTo(0)
      table.decimal('gross_sales_vfp', 15, 2).defaultTo(0)
      table.decimal('gross_sales_prior_year', 15, 2).defaultTo(0)
      table.decimal('gross_sales_actual_ytd', 15, 2).defaultTo(0)
      table.decimal('gross_sales_plan_ytd', 15, 2).defaultTo(0)
      table.decimal('gross_sales_vfp_ytd', 15, 2).defaultTo(0)
      table.decimal('gross_sales_prior_year_ytd', 15, 2).defaultTo(0)

      // Cost of Goods Sold additional columns
      table.decimal('cost_of_goods_sold_actual_ytd', 15, 2).defaultTo(0)
      table.decimal('cost_of_goods_sold_plan_ytd', 15, 2).defaultTo(0)
      table.decimal('cost_of_goods_sold_vfp_ytd', 15, 2).defaultTo(0)
      table.decimal('cost_of_goods_sold_prior_year_ytd', 15, 2).defaultTo(0)

      // Total Labor additional columns
      table.decimal('total_labor_actual_ytd', 15, 2).defaultTo(0)
      table.decimal('total_labor_plan_ytd', 15, 2).defaultTo(0)
      table.decimal('total_labor_vfp_ytd', 15, 2).defaultTo(0)
      table.decimal('total_labor_prior_year_ytd', 15, 2).defaultTo(0)

      // Controllables columns
      table.decimal('controllables_plan', 15, 2).defaultTo(0)
      table.decimal('controllables_vfp', 15, 2).defaultTo(0)
      table.decimal('controllables_prior_year', 15, 2).defaultTo(0)
      table.decimal('controllables_actual_ytd', 15, 2).defaultTo(0)
      table.decimal('controllables_plan_ytd', 15, 2).defaultTo(0)
      table.decimal('controllables_vfp_ytd', 15, 2).defaultTo(0)
      table.decimal('controllables_prior_year_ytd', 15, 2).defaultTo(0)

      // Controllable Profit columns
      table.decimal('controllable_profit_plan', 15, 2).defaultTo(0)
      table.decimal('controllable_profit_vfp', 15, 2).defaultTo(0)
      table.decimal('controllable_profit_prior_year', 15, 2).defaultTo(0)
      table.decimal('controllable_profit_actual_ytd', 15, 2).defaultTo(0)
      table.decimal('controllable_profit_plan_ytd', 15, 2).defaultTo(0)
      table.decimal('controllable_profit_vfp_ytd', 15, 2).defaultTo(0)
      table.decimal('controllable_profit_prior_year_ytd', 15, 2).defaultTo(0)

      // Advertising columns
      table.decimal('advertising_plan', 15, 2).defaultTo(0)
      table.decimal('advertising_vfp', 15, 2).defaultTo(0)
      table.decimal('advertising_prior_year', 15, 2).defaultTo(0)
      table.decimal('advertising_actual_ytd', 15, 2).defaultTo(0)
      table.decimal('advertising_plan_ytd', 15, 2).defaultTo(0)
      table.decimal('advertising_vfp_ytd', 15, 2).defaultTo(0)
      table.decimal('advertising_prior_year_ytd', 15, 2).defaultTo(0)

      // Fixed Costs columns
      table.decimal('fixed_costs_plan', 15, 2).defaultTo(0)
      table.decimal('fixed_costs_vfp', 15, 2).defaultTo(0)
      table.decimal('fixed_costs_prior_year', 15, 2).defaultTo(0)
      table.decimal('fixed_costs_actual_ytd', 15, 2).defaultTo(0)
      table.decimal('fixed_costs_plan_ytd', 15, 2).defaultTo(0)
      table.decimal('fixed_costs_vfp_ytd', 15, 2).defaultTo(0)
      table.decimal('fixed_costs_prior_year_ytd', 15, 2).defaultTo(0)

      // Restaurant Contribution columns
      table.decimal('restaurant_contribution_plan', 15, 2).defaultTo(0)
      table.decimal('restaurant_contribution_vfp', 15, 2).defaultTo(0)
      table.decimal('restaurant_contribution_prior_year', 15, 2).defaultTo(0)
      table.decimal('restaurant_contribution_actual_ytd', 15, 2).defaultTo(0)
      table.decimal('restaurant_contribution_plan_ytd', 15, 2).defaultTo(0)
      table.decimal('restaurant_contribution_vfp_ytd', 15, 2).defaultTo(0)
      table.decimal('restaurant_contribution_prior_year_ytd', 15, 2).defaultTo(0)

      // Cashflow columns
      table.decimal('cashflow_plan', 15, 2).defaultTo(0)
      table.decimal('cashflow_vfp', 15, 2).defaultTo(0)
      table.decimal('cashflow_prior_year', 15, 2).defaultTo(0)
      table.decimal('cashflow_actual_ytd', 15, 2).defaultTo(0)
      table.decimal('cashflow_plan_ytd', 15, 2).defaultTo(0)
      table.decimal('cashflow_vfp_ytd', 15, 2).defaultTo(0)
      table.decimal('cashflow_prior_year_ytd', 15, 2).defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop all the added columns
      table.dropColumn([
        'net_sales_actual_ytd', 'net_sales_plan_ytd', 'net_sales_vfp_ytd', 'net_sales_prior_year_ytd',
        'gross_sales_plan', 'gross_sales_vfp', 'gross_sales_prior_year', 'gross_sales_actual_ytd', 'gross_sales_plan_ytd', 'gross_sales_vfp_ytd', 'gross_sales_prior_year_ytd',
        'cost_of_goods_sold_actual_ytd', 'cost_of_goods_sold_plan_ytd', 'cost_of_goods_sold_vfp_ytd', 'cost_of_goods_sold_prior_year_ytd',
        'total_labor_actual_ytd', 'total_labor_plan_ytd', 'total_labor_vfp_ytd', 'total_labor_prior_year_ytd',
        'controllables_plan', 'controllables_vfp', 'controllables_prior_year', 'controllables_actual_ytd', 'controllables_plan_ytd', 'controllables_vfp_ytd', 'controllables_prior_year_ytd',
        'controllable_profit_plan', 'controllable_profit_vfp', 'controllable_profit_prior_year', 'controllable_profit_actual_ytd', 'controllable_profit_plan_ytd', 'controllable_profit_vfp_ytd', 'controllable_profit_prior_year_ytd',
        'advertising_plan', 'advertising_vfp', 'advertising_prior_year', 'advertising_actual_ytd', 'advertising_plan_ytd', 'advertising_vfp_ytd', 'advertising_prior_year_ytd',
        'fixed_costs_plan', 'fixed_costs_vfp', 'fixed_costs_prior_year', 'fixed_costs_actual_ytd', 'fixed_costs_plan_ytd', 'fixed_costs_vfp_ytd', 'fixed_costs_prior_year_ytd',
        'restaurant_contribution_plan', 'restaurant_contribution_vfp', 'restaurant_contribution_prior_year', 'restaurant_contribution_actual_ytd', 'restaurant_contribution_plan_ytd', 'restaurant_contribution_vfp_ytd', 'restaurant_contribution_prior_year_ytd',
        'cashflow_plan', 'cashflow_vfp', 'cashflow_prior_year', 'cashflow_actual_ytd', 'cashflow_plan_ytd', 'cashflow_vfp_ytd', 'cashflow_prior_year_ytd'
      ])
    })
  }
}