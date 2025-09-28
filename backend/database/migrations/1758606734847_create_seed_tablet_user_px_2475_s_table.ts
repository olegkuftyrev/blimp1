import { BaseSchema } from '@adonisjs/lucid/schema'
import Database from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'

export default class extends BaseSchema {
  protected tableName = 'seed_tablet_user_px_2475_s'

  async up() {
    // Insert a single tablet user px2475
    const identifier = 'px2475'
    const email = `${identifier}@pandarg.com`
    const passwordPlain = `${identifier}${identifier}`
    const password = await hash.use('scrypt').make(passwordPlain)

    const exists = await Database.from('users').where('email', email).first()
    if (!exists) {
      await Database.table('users').insert({
        full_name: identifier,
        email,
        password,
        created_at: new Date(),
        updated_at: new Date(),
      })
    }
  }

  async down() {
    await Database.from('users').where('email', 'px2475@pandarg.com').delete()
  }
}