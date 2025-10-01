import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import env from '#start/env'

export default class extends BaseSeeder {
  public static environment = ['development', 'testing', 'production'] as const

  async run() {
    const adminEmail = env.get('ADMIN_EMAIL', 'oleg@kuftyrev.us')
    const adminPassword = env.get('ADMIN_PASSWORD', 'Panda1337!asd')

    const existing = await User.findBy('email', adminEmail)
    if (existing) {
      console.log(`ℹ️ Admin already exists: ${adminEmail} (id=${existing.id})`)
      return
    }

    await User.create({
      email: adminEmail,
      password: adminPassword,
      fullName: 'Administrator',
      role: 'admin',
      jobTitle: 'RDO',
    })

    console.log(`✅ Admin user created: ${adminEmail}`)
  }
}


