import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Audit extends BaseModel {
  public static table = 'audit_log'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare actorUserId: number | null

  @column()
  declare action: string

  @column()
  declare entityType: string

  @column()
  declare entityId: number | null

  @column()
  declare payload: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
