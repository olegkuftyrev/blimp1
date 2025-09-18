import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, beforeSave } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import MenuItem from './menu_item.js'
import Order from './order.js'

export default class Restaurant extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare address: string

  @column()
  declare phone: string

  @column()
  declare isActive: boolean

  @column()
  declare ownerUserId: number | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => MenuItem)
  declare menuItems: HasMany<typeof MenuItem>

  @hasMany(() => Order)
  declare orders: HasMany<typeof Order>

  @beforeSave()
  static async validateUniqueName(restaurant: Restaurant) {
    if (restaurant.$dirty.name) {
      const existingRestaurant = await Restaurant.query()
        .where('name', restaurant.name)
        .whereNot('id', restaurant.id || 0)
        .first()

      if (existingRestaurant) {
        throw new Error('Restaurant name must be unique')
      }
    }
  }
}