import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Restaurant from './restaurant.js'

export default class MenuItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare itemTitle: string

  @column()
  declare batchBreakfast: number

  @column()
  declare batchLunch: number

  @column()
  declare batchDowntime: number

  @column()
  declare batchDinner: number

  @column({ columnName: 'cooking_time_batch1' })
  declare cookingTimeBatch1: number

  @column({ columnName: 'cooking_time_batch2' })
  declare cookingTimeBatch2: number

  @column({ columnName: 'cooking_time_batch3' })
  declare cookingTimeBatch3: number

  @column()
  declare status: string

  @column()
  declare restaurantId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Restaurant)
  declare restaurant: BelongsTo<typeof Restaurant>
}
