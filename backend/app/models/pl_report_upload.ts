import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PlReport from './pl_report.js'
import User from './user.js'

export default class PlReportUpload extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare plReportId: number

  @column()
  declare userId: number

  @column()
  declare fileName: string

  @column()
  declare fileSize: number

  @column()
  declare uploadStatus: string

  @column()
  declare errorMessage: string

  @column()
  declare metadata: any

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PlReport)
  declare plReport: BelongsTo<typeof PlReport>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}