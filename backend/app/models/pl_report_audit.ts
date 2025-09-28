import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PlReport from './pl_report.js'
import User from './user.js'

export default class PlReportAudit extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare plReportId: number

  @column()
  declare userId: number

  @column()
  declare action: string

  @column()
  declare changes: any

  @column()
  declare ipAddress: string

  @column()
  declare userAgent: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => PlReport)
  declare plReport: BelongsTo<typeof PlReport>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}