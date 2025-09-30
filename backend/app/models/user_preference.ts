import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class UserPreference extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare preferenceKey: string

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: string) => {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }
  })
  declare preferenceValue: any

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}