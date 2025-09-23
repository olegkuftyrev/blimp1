import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type InviteRole = 'admin' | 'ops_lead' | 'black_shirt' | 'associate' | 'tablet'
export type InviteJobTitle = 'Hourly Associate' | 'AM' | 'Chef' | 'SM/GM/TL' | 'ACO' | 'RDO'

export default class Invitation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column()
  declare role: InviteRole

  @column()
  declare createdByUserId: number | null

  @column()
  declare restaurantId: number | null

  @column()
  declare jobTitle: InviteJobTitle | null

  @column.dateTime()
  declare usedAt: DateTime | null

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
