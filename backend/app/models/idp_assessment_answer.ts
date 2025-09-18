import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import IdpAssessment from './idp_assessment.js'
import IdpQuestion from './idp_question.js'

export default class IdpAssessmentAnswer extends BaseModel {
  public static table = 'idp_assessment_answers'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare assessmentId: number

  @column()
  declare questionId: number

  @column()
  declare answer: 'yes' | 'no' // The user's answer

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => IdpAssessment, {
    foreignKey: 'assessmentId',
  })
  declare assessment: BelongsTo<typeof IdpAssessment>

  @belongsTo(() => IdpQuestion, {
    foreignKey: 'questionId',
  })
  declare question: BelongsTo<typeof IdpQuestion>
}
