import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import IdpCompetency from './idp_competency.js'

export default class IdpAction extends BaseModel {
  public static table = 'idp_actions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare competencyId: number

  @column()
  declare actionId: string // e.g., "businessInsight-a1"

  @column()
  declare action: string // The action description

  @column()
  declare measurement: string // How to measure success

  @column()
  declare startDate: string | null // e.g., "1d", "7d", "28d"

  @column()
  declare endDate: string | null // e.g., "28d"

  @column({
    serialize: (value: unknown) => {
      if (Array.isArray(value)) return value
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return []
        }
      }
      return []
    },
    prepare: (value: string[] | null) => {
      return value ? JSON.stringify(value) : null
    },
  })
  declare responsible: string[] | null // Array of responsible parties

  @column({
    serialize: (value: unknown) => {
      if (Array.isArray(value)) return value
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return []
        }
      }
      return []
    },
    prepare: (value: string[] | null) => {
      return value ? JSON.stringify(value) : null
    },
  })
  declare resources: string[] | null // Array of resources

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
