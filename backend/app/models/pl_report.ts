import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Restaurant from './restaurant.js'
import PlReportLineItem from './pl_report_line_item.js'

export default class PlReport extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare restaurantId: number

  @column()
  declare storeName: string

  @column()
  declare company: string

  @column()
  declare period: string

  @column()
  declare translationCurrency: string

  // New fields for better tracking
  @column()
  declare year: number

  @column()
  declare fileName: string

  @column()
  declare fileSize: number

  @column()
  declare uploadStatus: string

  @column()
  declare errorMessage: string

  @column()
  declare uploadedBy: number

  // Summary Financial Data (Current Period)
  @column()
  declare netSales: number

  @column()
  declare grossSales: number

  @column()
  declare costOfGoodsSold: number

  @column()
  declare totalLabor: number

  @column()
  declare controllables: number

  @column()
  declare controllableProfit: number

  @column()
  declare advertising: number

  @column()
  declare fixedCosts: number

  @column()
  declare restaurantContribution: number

  @column()
  declare cashflow: number

  // Plan vs Actual Summary - Net Sales
  @column()
  declare netSalesPlan: number

  @column()
  declare netSalesVfp: number

  @column()
  declare netSalesPriorYear: number

  @column()
  declare netSalesActualYtd: number

  @column()
  declare netSalesPlanYtd: number

  @column()
  declare netSalesVfpYtd: number

  @column()
  declare netSalesPriorYearYtd: number

  // Plan vs Actual Summary - Gross Sales
  @column()
  declare grossSalesPlan: number

  @column()
  declare grossSalesVfp: number

  @column()
  declare grossSalesPriorYear: number

  @column()
  declare grossSalesActualYtd: number

  @column()
  declare grossSalesPlanYtd: number

  @column()
  declare grossSalesVfpYtd: number

  @column()
  declare grossSalesPriorYearYtd: number

  // Plan vs Actual Summary - Cost of Goods Sold
  @column()
  declare costOfGoodsSoldPlan: number

  @column()
  declare costOfGoodsSoldVfp: number

  @column()
  declare costOfGoodsSoldPriorYear: number

  @column()
  declare costOfGoodsSoldActualYtd: number

  @column()
  declare costOfGoodsSoldPlanYtd: number

  @column()
  declare costOfGoodsSoldVfpYtd: number

  @column()
  declare costOfGoodsSoldPriorYearYtd: number

  // Plan vs Actual Summary - Total Labor
  @column()
  declare totalLaborPlan: number

  @column()
  declare totalLaborVfp: number

  @column()
  declare totalLaborPriorYear: number

  @column()
  declare totalLaborActualYtd: number

  @column()
  declare totalLaborPlanYtd: number

  @column()
  declare totalLaborVfpYtd: number

  @column()
  declare totalLaborPriorYearYtd: number

  // Plan vs Actual Summary - Controllables
  @column()
  declare controllablesPlan: number

  @column()
  declare controllablesVfp: number

  @column()
  declare controllablesPriorYear: number

  @column()
  declare controllablesActualYtd: number

  @column()
  declare controllablesPlanYtd: number

  @column()
  declare controllablesVfpYtd: number

  @column()
  declare controllablesPriorYearYtd: number

  // Plan vs Actual Summary - Controllable Profit
  @column()
  declare controllableProfitPlan: number

  @column()
  declare controllableProfitVfp: number

  @column()
  declare controllableProfitPriorYear: number

  @column()
  declare controllableProfitActualYtd: number

  @column()
  declare controllableProfitPlanYtd: number

  @column()
  declare controllableProfitVfpYtd: number

  @column()
  declare controllableProfitPriorYearYtd: number

  // Plan vs Actual Summary - Advertising
  @column()
  declare advertisingPlan: number

  @column()
  declare advertisingVfp: number

  @column()
  declare advertisingPriorYear: number

  @column()
  declare advertisingActualYtd: number

  @column()
  declare advertisingPlanYtd: number

  @column()
  declare advertisingVfpYtd: number

  @column()
  declare advertisingPriorYearYtd: number

  // Plan vs Actual Summary - Fixed Costs
  @column()
  declare fixedCostsPlan: number

  @column()
  declare fixedCostsVfp: number

  @column()
  declare fixedCostsPriorYear: number

  @column()
  declare fixedCostsActualYtd: number

  @column()
  declare fixedCostsPlanYtd: number

  @column()
  declare fixedCostsVfpYtd: number

  @column()
  declare fixedCostsPriorYearYtd: number

  // Plan vs Actual Summary - Restaurant Contribution
  @column()
  declare restaurantContributionPlan: number

  @column()
  declare restaurantContributionVfp: number

  @column()
  declare restaurantContributionPriorYear: number

  @column()
  declare restaurantContributionActualYtd: number

  @column()
  declare restaurantContributionPlanYtd: number

  @column()
  declare restaurantContributionVfpYtd: number

  @column()
  declare restaurantContributionPriorYearYtd: number

  // Plan vs Actual Summary - Cashflow
  @column()
  declare cashflowPlan: number

  @column()
  declare cashflowVfp: number

  @column()
  declare cashflowPriorYear: number

  @column()
  declare cashflowActualYtd: number

  @column()
  declare cashflowPlanYtd: number

  @column()
  declare cashflowVfpYtd: number

  @column()
  declare cashflowPriorYearYtd: number

  @column()
  declare totalTransactions: number

  @column()
  declare checkAverage: number

  @column()
  declare directLaborHours: number

  @column()
  declare averageHourlyWage: number

  @column()
  declare directHoursProductivity: number

  @column()
  declare totalHoursProductivity: number

  @column()
  declare managementHeadcount: number

  @column()
  declare assistantManagerHeadcount: number

  @column()
  declare chefHeadcount: number

  @column()
  declare breakfastPercentage: number

  @column()
  declare lunchPercentage: number

  @column()
  declare afternoonPercentage: number

  @column()
  declare eveningPercentage: number

  @column()
  declare dinnerPercentage: number

  @column()
  declare dineInPercentage: number

  @column()
  declare takeOutPercentage: number

  @column()
  declare driveThruPercentage: number

  @column()
  declare thirdPartyDigitalPercentage: number

  @column()
  declare pandaDigitalPercentage: number

  @column()
  declare inStoreCateringPercentage: number

  @column()
  declare cateringSales: number

  @column()
  declare pandaDigitalSales: number

  @column()
  declare thirdPartyDigitalSales: number

  @column()
  declare rewardRedemptions: number

  @column()
  declare fundraisingEventsSales: number

  @column()
  declare virtualFundraisingSales: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Restaurant)
  declare restaurant: BelongsTo<typeof Restaurant>

  @hasMany(() => PlReportLineItem)
  declare lineItems: HasMany<typeof PlReportLineItem>
}
