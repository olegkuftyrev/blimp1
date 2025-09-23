import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import PLUserAnswer from './pl_user_answer.js'

export default class PLQuestion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare questionId: string

  @column()
  declare label: string

  @column()
  declare explanation: string

  @column()
  declare formula: string

  @column({ columnName: 'a1' })
  declare a1: string

  @column({ columnName: 'a2' })
  declare a2: string

  @column({ columnName: 'a3' })
  declare a3: string

  @column({ columnName: 'a4' })
  declare a4: string

  @column()
  declare correctAnswer: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => PLUserAnswer)
  declare userAnswers: HasMany<typeof PLUserAnswer>
}
