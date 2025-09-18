import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

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
}
