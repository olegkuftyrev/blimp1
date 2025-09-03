import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

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

  @column()
  declare cookingTimeBatch1: number

  @column()
  declare cookingTimeBatch2: number

  @column()
  declare cookingTimeBatch3: number

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
