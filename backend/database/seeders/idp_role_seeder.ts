import { BaseSeeder } from '@adonisjs/lucid/seeders'
import IdpRole from '#models/idp_role'

export default class extends BaseSeeder {
  async run() {
    // Clear existing data
    await IdpRole.query().delete()

    // Create roles based on the original data structure
    const roles = [
      {
        label: 'Shift Leader',
        title: 'Hourly Associate',
        description: 'Entry-level role focusing on core competencies',
        userRole: 'associate', // Maps to user.role
        isActive: true,
      },
      {
        label: 'Assistant Manager',
        title: 'AM/Chef, SM/GM, TL',
        description: 'Management role with leadership responsibilities',
        userRole: 'black_shirt', // Maps to user.role (operations leadership)
        isActive: true,
      },
      {
        label: 'ACO',
        title: 'ACO, RDO',
        description: 'Senior leadership role with strategic responsibilities',
        userRole: 'ops_lead', // Maps to user.role (highest level)
        isActive: true,
      },
      {
        label: 'Executive',
        title: 'Admin/Executive',
        description: 'Executive level with full strategic and operational oversight',
        userRole: 'admin', // Maps to user.role (admin level)
        isActive: true,
      },
    ]

    await IdpRole.createMany(roles)
    console.log('✅ IDP Roles seeded successfully')
  }
}