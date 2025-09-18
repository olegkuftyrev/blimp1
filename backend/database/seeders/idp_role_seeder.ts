import { BaseSeeder } from '@adonisjs/lucid/seeders'
import IdpRole from '#models/idp_role'

export default class extends BaseSeeder {
  async run() {
    // Clear existing data
    await IdpRole.query().delete()

    // Simple 1:1 mapping - IDP roles = User roles
    const roles = [
      {
        label: 'Associate',
        title: 'Associate',
        description: 'Entry-level role focusing on core competencies',
        user_role: 'associate',
        isActive: true,
      },
      {
        label: 'Black Shirt',
        title: 'Black Shirt',
        description: 'Management role with leadership responsibilities',
        user_role: 'black_shirt',
        isActive: true,
      },
      {
        label: 'Operations Lead',
        title: 'Operations Lead',
        description: 'Senior leadership role with strategic responsibilities',
        user_role: 'ops_lead',
        isActive: true,
      },
      {
        label: 'Admin',
        title: 'Admin',
        description: 'Administrative role with full system access',
        user_role: 'admin',
        isActive: true,
      },
    ]

    await IdpRole.createMany(roles)
    console.log('✅ IDP Roles seeded successfully')
  }
}