import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import IdpCompetency from './idp_competency.js'

export default class IdpRole extends BaseModel {
  public static table = 'idp_roles'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare label: string // e.g., "Shift Leader", "Assistant Manager", "ACO"

  @column()
  declare title: string // Display title

  @column()
  declare description: string | null

  @column()
  declare userRole: string // Maps to user.role (associate, shift_leader, assistant_manager, etc.)

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => IdpCompetency, {
    foreignKey: 'roleId',
  })
  declare competencies: HasMany<typeof IdpCompetency>
}
