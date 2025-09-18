import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import IdpRole from './idp_role.js'
import IdpQuestion from './idp_question.js'
import IdpAction from './idp_action.js'
import IdpDescription from './idp_description.js'

export default class IdpCompetency extends BaseModel {
  public static table = 'idp_competencies'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare roleId: number

  @column()
  declare competencyId: string // e.g., "businessInsight", "actionOriented"

  @column()
  declare label: string // e.g., "Business Insight", "Action Oriented"

  @column()
  declare description: string | null

  @column()
  declare sortOrder: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => IdpRole, {
    foreignKey: 'roleId',
  })
  declare role: BelongsTo<typeof IdpRole>

  @hasMany(() => IdpQuestion, {
    foreignKey: 'competencyId',
  })
  declare questions: HasMany<typeof IdpQuestion>

  @hasMany(() => IdpAction, {
    foreignKey: 'competencyId',
  })
  declare actions: HasMany<typeof IdpAction>

  @hasMany(() => IdpDescription, {
    foreignKey: 'competencyId',
  })
  declare descriptions: HasMany<typeof IdpDescription>
}
