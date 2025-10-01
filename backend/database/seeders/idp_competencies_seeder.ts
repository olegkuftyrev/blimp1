import { BaseSeeder } from '@adonisjs/lucid/seeders'
import IdpRole from '#models/idp_role'
import IdpCompetency from '#models/idp_competency'
import IdpQuestion from '#models/idp_question'
import IdpAction from '#models/idp_action'
import { competenciesData } from '../data/competencies_data.js'

export default class extends BaseSeeder {
  async run() {
    // Check dependencies first
    const roles = await IdpRole.all()
    if (roles.length === 0) {
      console.log('⚠️ No IDP roles found. Please run idp_role_seeder first.')
      return
    }
    const roleMap = new Map(roles.map(role => [role.label, role]))

    // Clear existing data in reverse order (due to foreign keys)
    await IdpAction.query().delete()
    await IdpQuestion.query().delete()
    await IdpCompetency.query().delete()

    console.log('🔄 Seeding IDP competencies...')

    let competencyIndex = 1; // Start from 1 for sort order

    for (const competencyData of competenciesData) {
      console.log(`  📝 Processing: ${competencyData.label}`)
      
      // Create competency for each specified role
      for (const roleLabel of competencyData.roleLabels) {
        const role = roleMap.get(roleLabel)
        if (!role) {
          console.log(`    ⚠️  Role not found: ${roleLabel}`)
          continue
        }

        // Create competency
        const competency = await IdpCompetency.create({
          roleId: role.id,
          competencyId: competencyData.id,
          label: competencyData.label,
          description: null,
          sortOrder: competencyIndex, // Use incremental index as sort order
          isActive: true,
        })

        console.log(`    ✅ Created competency for role: ${roleLabel}`)

        // Create questions
        for (let i = 0; i < competencyData.questions.length; i++) {
          const questionData = competencyData.questions[i]
          await IdpQuestion.create({
            competencyId: competency.id,
            questionId: questionData.id,
            question: questionData.question,
            sortOrder: i + 1,
            isActive: true,
          })
        }

        console.log(`    📋 Created ${competencyData.questions.length} questions`)

        // Create actions
        for (let i = 0; i < competencyData.actions.length; i++) {
          const actionData = competencyData.actions[i]
          await IdpAction.create({
            competencyId: competency.id,
            actionId: actionData.id,
            action: actionData.action,
            measurement: actionData.measurement,
            startDate: actionData.startDate || null,
            endDate: actionData.endDate || null,
            responsible: actionData.responsible || null,
            resources: actionData.resources || null,
            sortOrder: i + 1,
            isActive: true,
          })
        }

        console.log(`    🎯 Created ${competencyData.actions.length} actions`)
      }
      
      competencyIndex++; // Increment for next competency
    }

    console.log('✅ IDP Competencies seeded successfully')
    
    // Summary
    const totalCompetencies = await IdpCompetency.query().count('* as total')
    const totalQuestions = await IdpQuestion.query().count('* as total')
    const totalActions = await IdpAction.query().count('* as total')
    
    console.log(`📊 Summary:`)
    console.log(`   - Competencies: ${totalCompetencies[0].$extras.total}`)
    console.log(`   - Questions: ${totalQuestions[0].$extras.total}`)
    console.log(`   - Actions: ${totalActions[0].$extras.total}`)
  }
}

