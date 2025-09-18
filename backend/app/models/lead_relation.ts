import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class LeadRelation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare leadUserId: number

  @column()
  declare blackShirtUserId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
