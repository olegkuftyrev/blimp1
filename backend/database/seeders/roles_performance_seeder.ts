import { BaseSeeder } from '@adonisjs/lucid/seeders'
import RolePerformance from '#models/role_performance'
import PerformanceSection from '#models/performance_section'
import PerformanceItem from '#models/performance_item'
import { rolesPerformanceData } from '../data/roles_performance_data.js'
import crypto from 'crypto'

export default class extends BaseSeeder {
  async run() {
    // Create a mapping for global question IDs
    const globalQuestionMap = new Map<string, string>()

    // Function to get or create global question ID
    const getGlobalQuestionId = (questionText: string): string => {
      if (!globalQuestionMap.has(questionText)) {
        globalQuestionMap.set(questionText, crypto.randomUUID())
      }
      return globalQuestionMap.get(questionText)!
    }

    const roleData = [
      {
        key: 'performanceChCross',
        name: 'counter_help_cross_trained',
        displayName: 'Counter Help Cross Trained',
        data: rolesPerformanceData.performanceChCross.CounterHelpCrossTrained,
        sortOrder: 1
      },
      {
        key: 'performanceCh',
        name: 'counter_help',
        displayName: 'Counter Help',
        data: rolesPerformanceData.performanceCh.CounterHelp,
        sortOrder: 2
      },
      {
        key: 'performanceCook',
        name: 'cook',
        displayName: 'Cook',
        data: rolesPerformanceData.performanceCook.Cook,
        sortOrder: 3
      },
      {
        key: 'performanceKh',
        name: 'kitchen_help',
        displayName: 'Kitchen Help',
        data: rolesPerformanceData.performanceKh.KitchenHelp,
        sortOrder: 4
      },
      {
        key: 'performanceSl',
        name: 'shift_lead',
        displayName: 'Shift Lead',
        data: rolesPerformanceData.performanceSl.ShiftLead,
        sortOrder: 5
      }
    ]

    for (const roleInfo of roleData) {
      // Create or update role
      const role = await RolePerformance.updateOrCreate(
        { name: roleInfo.name },
        {
          name: roleInfo.name,
          displayName: roleInfo.displayName,
          description: `Performance assessment for ${roleInfo.displayName} role`,
          trainingTimeFrame: roleInfo.data.TrainingTimeFrame || null,
          isActive: true,
          sortOrder: roleInfo.sortOrder
        }
      )

      console.log(`Created/Updated role: ${roleInfo.displayName}`)

      // Create sections and items
      for (const sectionData of roleInfo.data.Sections) {
        const section = await PerformanceSection.updateOrCreate(
          { rolePerformanceId: role.id, title: sectionData.title },
          {
            rolePerformanceId: role.id,
            title: sectionData.title,
            description: null,
            sortOrder: sectionData.id
          }
        )

        console.log(`  Created/Updated section: ${sectionData.title}`)

        // Create items for this section
        for (let i = 0; i < sectionData.items.length; i++) {
          const itemText = sectionData.items[i]
          const globalQuestionId = getGlobalQuestionId(itemText)

          await PerformanceItem.updateOrCreate(
            { performanceSectionId: section.id, text: itemText },
            {
              performanceSectionId: section.id,
              text: itemText,
              description: null,
              sortOrder: i + 1,
              globalQuestionId: globalQuestionId
            }
          )
        }

        console.log(`    Created/Updated ${sectionData.items.length} items`)
      }
    }

    console.log('Roles Performance seeder completed successfully!')
    console.log(`Total unique questions: ${globalQuestionMap.size}`)
  }
}

