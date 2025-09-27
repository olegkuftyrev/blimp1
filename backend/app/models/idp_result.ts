import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import IdpAssessment from './idp_assessment.js'
import IdpCompetency from './idp_competency.js'

export default class IdpResult extends BaseModel {
  public static table = 'idp_results'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare assessmentId: number

  @column()
  declare competencyId: number

  @column()
  declare measurement: string // User's custom measurement text (not linked to idp_actions)

  @column()
  declare actionSteps: string // User's custom action steps text

  @column()
  declare responsibleResources: string // User's custom responsible/resources text

  @column()
  declare startDate: string | null // User's custom start date

  @column()
  declare completionDate: string | null // User's custom completion date

  @column()
  declare status: 'not_started' | 'in_progress' | 'completed' | 'cancelled' // Result status

  @column()
  declare progress: number // Progress percentage (0-100)

  @column()
  declare notes: string | null // User's notes about the result

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => IdpAssessment, {
    foreignKey: 'assessmentId',
  })
  declare assessment: BelongsTo<typeof IdpAssessment>

  @belongsTo(() => IdpCompetency, {
    foreignKey: 'competencyId',
  })
  declare competency: BelongsTo<typeof IdpCompetency>
}