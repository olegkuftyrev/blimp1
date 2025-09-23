import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import PLUserAnswer from './pl_user_answer.js'

export default class PLTestSet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare questionIds: string // JSON string of question IDs

  @column()
  declare isDefault: boolean

  @column()
  declare isCompleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => PLUserAnswer)
  declare userAnswers: HasMany<typeof PLUserAnswer>

  // Virtual property to get question IDs as array
  get questionIdsArray(): number[] {
    try {
      return JSON.parse(this.questionIds || '[]')
    } catch {
      return []
    }
  }

  // Method to set question IDs from array
  set questionIdsArray(ids: number[]) {
    this.questionIds = JSON.stringify(ids)
  }
}

