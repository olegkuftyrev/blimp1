import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import MenuItem from './menu_item.js'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tableSection: number

  @column()
  declare menuItemId: number

  @column()
  declare batchSize: number

  @column()
  declare status: string

  @column.dateTime()
  declare timerStart: DateTime | null

  @column.dateTime()
  declare timerEnd: DateTime | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => MenuItem)
  declare menuItem: BelongsTo<typeof MenuItem>
}
