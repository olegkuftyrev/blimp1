import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import PLQuestion from './pl_question.js'
import PLTestSet from './pl_test_set.js'

export default class PLUserAnswer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare plQuestionId: number

  @column()
  declare plTestSetId: number

  @column()
  declare userAnswer: string

  @column()
  declare isCorrect: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => PLQuestion)
  declare plQuestion: BelongsTo<typeof PLQuestion>

  @belongsTo(() => PLTestSet)
  declare plTestSet: BelongsTo<typeof PLTestSet>
}
