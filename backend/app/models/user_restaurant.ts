import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Restaurant from './restaurant.js'

export default class UserRestaurant extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare restaurantId: number

  @column()
  declare addedByUserId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Restaurant)
  declare restaurant: BelongsTo<typeof Restaurant>
}
