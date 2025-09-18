import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import IdpCompetency from './idp_competency.js'

export default class IdpQuestion extends BaseModel {
  public static table = 'idp_questions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare competencyId: number

  @column()
  declare questionId: string // e.g., "businessInsight-q1"

  @column()
  declare question: string // The actual question text

  @column()
  declare sortOrder: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => IdpCompetency, {
    foreignKey: 'competencyId',
  })
  declare competency: BelongsTo<typeof IdpCompetency>
}
