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

  // Plan vs Actual Summary
  @column()
  declare netSalesPlan: number

  @column()
  declare netSalesVfp: number

  @column()
  declare netSalesPriorYear: number

  @column()
  declare costOfGoodsSoldPlan: number

  @column()
  declare costOfGoodsSoldVfp: number

  @column()
  declare costOfGoodsSoldPriorYear: number

  @column()
  declare totalLaborPlan: number

  @column()
  declare totalLaborVfp: number

  @column()
  declare totalLaborPriorYear: number

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
