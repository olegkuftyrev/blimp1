import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import IdpRole from '#models/idp_role'
import IdpAssessment from '#models/idp_assessment'
import IdpAssessmentAnswer from '#models/idp_assessment_answer'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    console.log('🔄 Seeding IDP assessments for all users...')

    // Check dependencies first
    const users = await User.all()
    if (users.length === 0) {
      console.log('⚠️ No users found. Please run admin_user_seeder first.')
      return
    }
    console.log(`📋 Found ${users.length} users`)

    const idpRoles = await IdpRole.all()
    if (idpRoles.length === 0) {
      console.log('⚠️ No IDP roles found. Please run idp_role_seeder first.')
      return
    }
    const roleMap = new Map(idpRoles.map(role => [role.userRole, role]))
    console.log(`🎯 Found ${idpRoles.length} IDP roles`)

    let createdAssessments = 0
    let skippedAssessments = 0

    for (const user of users) {
      console.log(`👤 Processing user: ${user.email} (${user.role})`)

      // Check if user already has an assessment
      const existingAssessment = await IdpAssessment.query()
        .where('userId', user.id)
        .where('isActive', true)
        .whereNull('deletedAt')
        .first()

      if (existingAssessment) {
        console.log(`  ⏭️  Skipping - already has assessment (${existingAssessment.status})`)
        skippedAssessments++
        continue
      }

      // Find matching IDP role
      const idpRole = roleMap.get(user.role)
      if (!idpRole) {
        console.log(`  ⚠️  No IDP role found for user role: ${user.role}`)
        continue
      }

      // Create assessment
      const assessment = await IdpAssessment.create({
        userId: user.id,
        roleId: idpRole.id,
        version: 1,
        status: 'draft', // Start as draft, users can complete later
        isActive: true,
      })

      console.log(`  ✅ Created assessment (ID: ${assessment.id})`)

      // For admin user, create some sample answers to demonstrate functionality
      if (user.email === 'admin@example.com') {
        console.log(`  🎯 Creating sample answers for admin user...`)
        
        // Get questions for this role
        const competencies = await idpRole.related('competencies').query()
          .where('isActive', true)
          .preload('questions', (query) => {
            query.where('isActive', true).orderBy('sortOrder')
          })

        let answerCount = 0
        for (const competency of competencies) {
          for (const question of competency.questions) {
            // Create some sample answers (mix of yes/no)
            const answers = ['yes', 'no'] as const
            const answer = answers[Math.floor(Math.random() * answers.length)]
            
            await IdpAssessmentAnswer.create({
              assessmentId: assessment.id,
              questionId: question.id,
              answer: answer,
            })
            answerCount++
          }
        }

        // Mark as completed for admin
        assessment.status = 'completed'
        assessment.startedAt = DateTime.now().minus({ hours: 1 })
        assessment.completedAt = DateTime.now()
        await assessment.save()

        console.log(`  📝 Created ${answerCount} sample answers and marked as completed`)
      }

      createdAssessments++
    }

    console.log('✅ IDP Assessment seeding completed!')
    console.log(`📊 Summary:`)
    console.log(`   - Created: ${createdAssessments} assessments`)
    console.log(`   - Skipped: ${skippedAssessments} existing assessments`)
    console.log(`   - Total users: ${users.length}`)
  }
}
