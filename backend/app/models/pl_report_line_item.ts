import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PlReport from './pl_report.js'

export default class PlReportLineItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare plReportId: number

  @column()
  declare category: string // Sales, Cost of Sales, Labor, Controllables, etc.

  @column()
  declare subcategory: string // Food Sales, Drink Sales, etc.

  @column()
  declare ledgerAccount: string

  // Current Period Data
  @column()
  declare actuals: number

  @column()
  declare actualsPercentage: number

  @column()
  declare plan: number

  @column()
  declare planPercentage: number

  @column()
  declare vfp: number // Variance from Plan

  @column()
  declare priorYear: number

  @column()
  declare priorYearPercentage: number

  // Year-to-Date Data
  @column()
  declare actualYtd: number

  @column()
  declare actualYtdPercentage: number

  @column()
  declare planYtd: number

  @column()
  declare planYtdPercentage: number

  @column()
  declare vfpYtd: number

  @column()
  declare priorYearYtd: number

  @column()
  declare priorYearYtdPercentage: number

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PlReport)
  declare plReport: BelongsTo<typeof PlReport>
}
