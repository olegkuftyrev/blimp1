import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import IdpRole from './idp_role.js'
import IdpAssessmentAnswer from './idp_assessment_answer.js'

export default class IdpAssessment extends BaseModel {
  public static table = 'idp_assessments'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare roleId: number

  @column()
  declare version: number // For versioning assessments

  @column()
  declare status: 'draft' | 'in_progress' | 'completed' // Assessment status

  @column()
  declare isActive: boolean // Only one active assessment per user

  @column.dateTime()
  declare startedAt: DateTime | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null // Soft delete

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => IdpRole, {
    foreignKey: 'roleId',
  })
  declare role: BelongsTo<typeof IdpRole>

  @hasMany(() => IdpAssessmentAnswer, {
    foreignKey: 'assessmentId',
  })
  declare answers: HasMany<typeof IdpAssessmentAnswer>

  // Computed properties for scores
  public async getCompetencyScores() {
    await this.load('answers', (query) => {
      query.preload('question', (q) => q.preload('competency'))
    })

    const scores: Record<string, number> = {}
    
    // Group answers by competency
    for (const answer of this.answers) {
      const competencyId = answer.question.competency.competencyId
      
      if (!scores[competencyId]) {
        scores[competencyId] = 0
      }
      
      if (answer.answer === 'yes') {
        scores[competencyId]++
      }
    }

    return scores
  }
}
