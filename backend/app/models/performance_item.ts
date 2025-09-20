import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import PerformanceSection from './performance_section.js'
import UserPerformanceAnswer from './user_performance_answer.js'

export default class PerformanceItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare performanceSectionId: number

  @column()
  declare text: string

  @column()
  declare description: string | null

  @column()
  declare sortOrder: number

  // Global identifier for the same question across different roles
  @column()
  declare globalQuestionId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PerformanceSection)
  declare section: BelongsTo<typeof PerformanceSection>

  @hasMany(() => UserPerformanceAnswer)
  declare answers: HasMany<typeof UserPerformanceAnswer>
}
