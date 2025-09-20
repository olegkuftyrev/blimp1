import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import PerformanceItem from './performance_item.js'

export type PerformanceAnswer = 'yes' | 'no'

export default class UserPerformanceAnswer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare performanceItemId: number

  @column()
  declare answer: PerformanceAnswer

  // Store the global question ID for easy syncing across roles
  @column()
  declare globalQuestionId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => PerformanceItem)
  declare performanceItem: BelongsTo<typeof PerformanceItem>
}
