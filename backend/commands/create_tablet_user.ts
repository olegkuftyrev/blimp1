import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'
import UserRestaurant from '#models/user_restaurant'
import hash from '@adonisjs/core/services/hash'
import Database from '@adonisjs/lucid/services/db'

export default class CreateTabletUser extends BaseCommand {
  static commandName = 'create:tablet-user'
  static description = 'Create a tablet user for a store code, e.g. PX2475 -> px2475@pandarg.com'

  static options: CommandOptions = {}

  async run() {
    const storeArg = this.parsed?.args?.[0] as string | undefined
    const store = (storeArg || 'px2475').toLowerCase()
    const identifier = store.startsWith('px') ? store : `px${store}`
    const email = `${identifier}@pandarg.com`
    const passwordPlain = `${identifier}${identifier}`

    try {
      // if restaurant exists by name containing PX code, link; otherwise skip linking
      const restaurant = await Database.from('restaurants')
        .where('name', 'like', `%${identifier.toUpperCase()}%`)
        .first()

      const existing = await User.findBy('email', email)
      if (existing) {
        this.logger.info(`Tablet user already exists: ${email}`)
        return
      }

      const password = await hash.use('scrypt').make(passwordPlain)

      const user = await User.create({
        fullName: identifier,
        email,
        password,
        role: 'tablet',
        jobTitle: 'Hourly Associate' as any,
      })

      if (restaurant) {
        await UserRestaurant.create({
          userId: user.id,
          restaurantId: restaurant.id,
          addedByUserId: null,
        })
        this.logger.info(`Linked tablet user to restaurant id=${restaurant.id}`)
      }

      this.logger.success(`Created tablet user: ${email}`)
    } catch (err: any) {
      this.logger.error('Failed to create tablet user:', err?.message || err)
      console.error(err)
      console.error(err?.stack)
    }
  }
}