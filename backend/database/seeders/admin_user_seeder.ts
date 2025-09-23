import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import env from '#start/env'

export default class extends BaseSeeder {
  public static environment = ['development', 'testing'] as const

  async run() {
    const adminEmail = env.get('ADMIN_EMAIL', 'admin@example.com')
    const adminPassword = env.get('ADMIN_PASSWORD', 'pA55w0rd!')

    const existing = await User.findBy('email', adminEmail)
    if (existing) {
      // Always reset to known credentials for development/testing
      existing.password = adminPassword
      existing.role = 'admin'
      existing.jobTitle = (existing.jobTitle as any) ?? 'RDO'
      await existing.save()
      console.log(`✅ Admin user updated: ${adminEmail}`)
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

    // Ensure a default tablet user exists for PX2475
    const tabletEmail = 'px2475@pandarg.com'
    const tablet = await User.findBy('email', tabletEmail)
    if (!tablet) {
      await User.create({
        email: tabletEmail,
        password: 'px2475px2475',
        fullName: 'px2475',
        role: 'tablet',
        jobTitle: 'Hourly Associate' as any,
      })
      console.log('✅ Tablet user created: px2475@pandarg.com')
    } else {
      console.log('ℹ️ Tablet user already exists: px2475@pandarg.com')
    }
  }
}


