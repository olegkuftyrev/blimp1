import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import RolePerformance from './role_performance.js'
import PerformanceItem from './performance_item.js'

export default class PerformanceSection extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare rolePerformanceId: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => RolePerformance)
  declare rolePerformance: BelongsTo<typeof RolePerformance>

  @hasMany(() => PerformanceItem)
  declare items: HasMany<typeof PerformanceItem>
}
