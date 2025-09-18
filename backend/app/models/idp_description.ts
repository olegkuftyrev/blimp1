import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import IdpCompetency from './idp_competency.js'

export default class IdpDescription extends BaseModel {
  public static table = 'idp_descriptions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare competencyId: number

  @column()
  declare type: 'overview' | 'definition' | 'examples' | 'behaviors' // Type of description

  @column()
  declare title: string // Title for this description section

  @column()
  declare content: string // The actual description content

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
