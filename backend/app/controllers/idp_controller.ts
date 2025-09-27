import type { HttpContext } from '@adonisjs/core/http'
import IdpRole from '#models/idp_role'
import IdpAssessment from '#models/idp_assessment'
import IdpAssessmentAnswer from '#models/idp_assessment_answer'
import IdpDevelopmentPlan from '#models/idp_development_plan'
import IdpResult from '#models/idp_result'
import IdpPolicy from '#policies/idp_policy'
import { DateTime } from 'luxon'

export default class IdpController {
  /**
   * Get available roles for IDP assessment
   */
  async getRoles({ response }: HttpContext) {
    try {
      const roles = await IdpRole.query()
        .where('is_active', true)
        .orderBy('id')

      return response.ok({
        data: roles,
        message: 'IDP roles retrieved successfully'
      })
    } catch (error) {
      console.error('Error fetching IDP roles:', error)
      return response.status(500).json({ error: 'Failed to fetch IDP roles' })
    }
  }

  /**
   * Get current user's IDP role based on their user role
   */
  async getCurrentRole({ auth, response }: HttpContext) {
    try {
      // Authenticate user using the API guard
      await auth.authenticate()
      
      const currentUser = auth.user!
      
      const role = await IdpRole.query()
        .where('user_role', currentUser.role)
        .where('is_active', true)
        .preload('competencies', (competencyQuery) => {
          competencyQuery
            .where('is_active', true)
            .orderBy('sort_order')
            .preload('questions', (questionQuery) => {
              questionQuery.where('is_active', true).orderBy('sort_order')
            })
            .preload('actions', (actionQuery) => {
              actionQuery.where('is_active', true).orderBy('sort_order')
            })
            .preload('descriptions', (descQuery) => {
              descQuery.where('is_active', true).orderBy('sort_order')
            })
        })
        .first()

      if (!role) {
        return response.notFound({
          data: null,
          message: `No IDP role found for user role: ${currentUser.role}`
        })
      }

      return response.ok({
        data: role,
        message: 'Current user IDP role retrieved successfully'
      })
    } catch (error) {
      console.error('Error fetching current user IDP role:', error)
      return response.status(500).json({ error: 'Failed to fetch current user IDP role' })
    }
  }

  /**
   * Get role by user role (maps user.role to IDP role)
   */
  async getRoleByUserRole({ params, response }: HttpContext) {
    try {
      const { userRole } = params
      
      const role = await IdpRole.query()
        .where('user_role', userRole)
        .where('is_active', true)
        .preload('competencies', (competencyQuery) => {
          competencyQuery
            .where('is_active', true)
            .orderBy('sort_order')
            .preload('questions', (questionQuery) => {
              questionQuery.where('is_active', true).orderBy('sort_order')
            })
            .preload('actions', (actionQuery) => {
              actionQuery.where('is_active', true).orderBy('sort_order')
            })
            .preload('descriptions', (descQuery) => {
              descQuery.where('is_active', true).orderBy('sort_order')
            })
        })
        .first()

      if (!role) {
        return response.status(404).json({ error: 'Role not found for user role' })
      }

      return response.ok({
        data: role,
        message: 'IDP role with competencies retrieved successfully'
      })
    } catch (error) {
      console.error('Error fetching IDP role:', error)
      return response.status(500).json({ error: 'Failed to fetch IDP role' })
    }
  }

  /**
   * Get current user's active assessment or create new one
   */
  async getCurrentAssessment({ auth, response }: HttpContext) {
    try {
      // Authenticate user using the API guard (same as /auth/me)
      await auth.authenticate()
      
      const user = auth.user!
      console.log('getCurrentAssessment: Current user:', user.id, user.email, user.role)
      
      // Find active assessment
      let assessment = await IdpAssessment.query()
        .where('user_id', user.id)
        .where('is_active', true)
        .whereNull('deleted_at')
        .preload('role')
        .preload('answers', (answerQuery) => {
          answerQuery.preload('question')
        })
        .first()

      if (!assessment) {
        // Find role based on user's role
        const role = await IdpRole.query()
          .where('user_role', user.role)
          .where('is_active', true)
          .first()

        if (!role) {
          return response.status(400).json({ 
            error: 'No IDP role found for your user role',
            userRole: user.role 
          })
        }

        // Create new assessment
        assessment = await IdpAssessment.create({
          userId: user.id,
          roleId: role.id,
          version: 1,
          status: 'draft',
          isActive: true,
        })

        await assessment.load('role')
        await assessment.load('answers')
      }

      return response.ok({
        data: assessment,
        message: 'Current assessment retrieved successfully'
      })
    } catch (error) {
      console.error('Error fetching current assessment:', error)
      return response.status(500).json({ error: 'Failed to fetch current assessment' })
    }
  }

  /**
   * Get a specific user's IDP assessment (with permission check)
   */
  async getUserAssessment({ auth, params, response }: HttpContext) {
    try {
      // Authenticate user using the API guard
      await auth.authenticate()
      
      const currentUser = auth.user!
      const targetUserId = parseInt(params.userId)
      
      if (isNaN(targetUserId)) {
        return response.status(400).json({ error: 'Invalid user ID' })
      }

      // Find the target user
      const User = await import('#models/user')
      const targetUser = await User.default.find(targetUserId)
      
      if (!targetUser) {
        return response.status(404).json({ error: 'User not found' })
      }

      // Check permission using policy
      const idpPolicy = new IdpPolicy()
      if (!(await idpPolicy.viewUserAssessment(currentUser, targetUser))) {
        return response.status(403).json({ error: 'You can only view IDPs of your team members' })
      }

      // Find active assessment for the target user
      let assessment = await IdpAssessment.query()
        .where('userId', targetUserId)
        .where('isActive', true)
        .whereNull('deletedAt')
        .preload('role', (roleQuery) => {
          roleQuery.preload('competencies', (competencyQuery) => {
            competencyQuery
              .where('isActive', true)
              .orderBy('sortOrder')
              .preload('questions', (questionQuery) => {
                questionQuery.where('isActive', true).orderBy('sortOrder')
              })
              .preload('actions', (actionQuery) => {
                actionQuery.where('isActive', true).orderBy('sortOrder')
              })
              .preload('descriptions', (descQuery) => {
                descQuery.where('isActive', true).orderBy('sortOrder')
              })
          })
        })
        .preload('answers', (answerQuery) => {
          answerQuery.preload('question')
        })
        .first()

      if (!assessment) {
        return response.ok({
          data: {
            user: targetUser,
            assessment: null,
            message: 'No active assessment found for this user'
          }
        })
      }

      // Get competency scores for the assessment
      const scores = await assessment.getCompetencyScores()

      return response.ok({
        data: {
          user: targetUser,
          assessment,
          scores
        },
        message: 'User assessment retrieved successfully'
      })
    } catch (error) {
      console.error('Error fetching user assessment:', error)
      return response.status(500).json({ error: 'Failed to fetch user assessment' })
    }
  }

  /**
   * Save assessment answers
   */
  async saveAnswers({ auth, request, response }: HttpContext) {
    try {
      // Authenticate user using the API guard
      await auth.authenticate()
      
      const user = auth.user!
      const { answers } = request.only(['answers']) // { questionId: 'yes'|'no' }

      // Get current active assessment
      const assessment = await IdpAssessment.query()
        .where('user_id', user.id)
        .where('is_active', true)
        .whereNull('deleted_at')
        .first()

      if (!assessment) {
        return response.status(404).json({ error: 'No active assessment found' })
      }

      // Update assessment status
      if (assessment.status === 'draft') {
        assessment.status = 'in_progress'
        assessment.startedAt = DateTime.now()
        await assessment.save()
      }

      // Save/update answers
      for (const [questionIdStr, answer] of Object.entries(answers)) {
        const questionId = parseInt(questionIdStr)
        
        // Upsert answer
        const existingAnswer = await IdpAssessmentAnswer.query()
          .where('assessmentId', assessment.id)
          .where('questionId', questionId)
          .first()

        if (existingAnswer) {
          existingAnswer.answer = answer as 'yes' | 'no'
          await existingAnswer.save()
        } else {
          await IdpAssessmentAnswer.create({
            assessmentId: assessment.id,
            questionId: questionId,
            answer: answer as 'yes' | 'no',
          })
        }
      }

      return response.ok({
        message: 'Answers saved successfully'
      })
    } catch (error) {
      console.error('Error saving answers:', error)
      return response.status(500).json({ error: 'Failed to save answers' })
    }
  }

  /**
   * Complete assessment and get results
   */
  async completeAssessment({ auth, response }: HttpContext) {
    try {
      // Authenticate user using the API guard
      await auth.authenticate()
      
      const user = auth.user!

      // Get current active assessment
      const assessment = await IdpAssessment.query()
        .where('user_id', user.id)
        .where('is_active', true)
        .whereNull('deleted_at')
        .preload('role', (roleQuery) => {
          roleQuery.preload('competencies', (competencyQuery) => {
            competencyQuery
              .where('is_active', true)
              .preload('questions', (questionQuery) => {
                questionQuery.where('is_active', true).orderBy('sort_order')
              })
              .preload('actions', (actionQuery) => {
                actionQuery.where('is_active', true).orderBy('sort_order')
              })
              .preload('descriptions', (descQuery) => {
                descQuery.where('is_active', true).orderBy('sort_order')
              })
          })
        })
        .preload('answers', (answerQuery) => {
          answerQuery.preload('question')
        })
        .first()

      if (!assessment) {
        return response.status(404).json({ error: 'No active assessment found' })
      }

      // Calculate competency scores
      const scores = await assessment.getCompetencyScores()

      // Mark assessment as completed
      assessment.status = 'completed'
      assessment.completedAt = DateTime.now()
      await assessment.save()

      return response.ok({
        data: {
          assessment,
          scores
        },
        message: 'Assessment completed successfully'
      })
    } catch (error) {
      console.error('Error completing assessment:', error)
      return response.status(500).json({ error: 'Failed to complete assessment' })
    }
  }

  /**
   * Show individual IDP item
   */
  async show({ params, response }: HttpContext) {
    try {
      return response.ok({
        data: { id: params.id },
        message: `IDP item ${params.id} - Individual Development Plant`
      })
    } catch (error) {
      console.error('Error in IDP show:', error)
      return response.status(500).json({ error: 'Failed to fetch IDP item' })
    }
  }

  /**
   * Show form for editing an IDP item
   */
  async edit({ params, response }: HttpContext) {
    try {
      return response.ok({
        data: { id: params.id },
        message: `Edit IDP item ${params.id} - Individual Development Plant`
      })
    } catch (error) {
      console.error('Error in IDP edit:', error)
      return response.status(500).json({ error: 'Failed to load IDP edit form' })
    }
  }

  /**
   * Handle form submission for updating an IDP item
   */
  async update({ params, response }: HttpContext) {
    try {
      return response.ok({
        data: { id: params.id },
        message: `IDP item ${params.id} updated - Individual Development Plant`
      })
    } catch (error) {
      console.error('Error in IDP update:', error)
      return response.status(500).json({ error: 'Failed to update IDP item' })
    }
  }

  /**
   * Delete an IDP item
   */
  async destroy({ params, response }: HttpContext) {
    try {
      return response.ok({
        message: `IDP item ${params.id} deleted - Individual Development Plant`
      })
    } catch (error) {
      console.error('Error in IDP destroy:', error)
      return response.status(500).json({ error: 'Failed to delete IDP item' })
    }
  }

  /**
   * Get development plan for current user's assessment
   */
  async getDevelopmentPlan({ auth, response }: HttpContext) {
    try {
      // Authenticate user using the API guard
      await auth.authenticate()
      
      const user = auth.user!

      // Get current active assessment
      const assessment = await IdpAssessment.query()
        .where('user_id', user.id)
        .where('is_active', true)
        .whereNull('deleted_at')
        .first()

      if (!assessment) {
        return response.status(404).json({ error: 'No active assessment found' })
      }

      // Get development plans with competencies
      const developmentPlans = await IdpDevelopmentPlan.query()
        .where('assessment_id', assessment.id)
        .where('is_active', true)
        .preload('competency')
        .orderBy('competency_id')
        .orderBy('created_at')

      // Group measurements by competency
      const groupedPlans = developmentPlans.reduce((acc, plan) => {
        const competencyId = plan.competencyId
        if (!acc[competencyId]) {
          acc[competencyId] = {
            competencyId: plan.competencyId,
            competencyName: plan.competency.label,
            measurements: []
          }
        }
        
        acc[competencyId].measurements.push({
          id: plan.id,
          text: plan.measurement,
          actionSteps: plan.actionSteps,
          responsibleResources: plan.responsibleResources,
          startDate: plan.startDate,
          completionDate: plan.completionDate
        })
        
        return acc
      }, {})

      const planItems = Object.values(groupedPlans)

      return response.ok({
        data: planItems,
        message: 'Development plan retrieved successfully'
      })
    } catch (error) {
      console.error('Error fetching development plan:', error)
      return response.status(500).json({ error: 'Failed to fetch development plan' })
    }
  }

  /**
   * Save or update development plan
   */
  async saveDevelopmentPlan({ auth, request, response }: HttpContext) {
    try {
      // Authenticate user using the API guard
      await auth.authenticate()
      
      const user = auth.user!
      const { competencyId, measurements, updateMode = false } = request.only([
        'competencyId', 'measurements', 'updateMode'
      ])

      // Get current active assessment
      const assessment = await IdpAssessment.query()
        .where('user_id', user.id)
        .where('is_active', true)
        .whereNull('deleted_at')
        .first()

      if (!assessment) {
        return response.status(404).json({ error: 'No active assessment found' })
      }

      // Check if competency belongs to user's role
      const role = await IdpRole.query()
        .where('id', assessment.roleId)
        .preload('competencies', (query) => {
          query.where('id', competencyId).where('is_active', true)
        })
        .first()

      if (!role || role.competencies.length === 0) {
        return response.status(400).json({ error: 'Invalid competency for user role' })
      }

      // Save or update measurements
      const savedMeasurements = []
      for (const measurement of measurements) {
        let developmentPlan
        
        if (updateMode && measurement.id && typeof measurement.id === 'number') {
          // Update existing measurement
          const existingPlan = await IdpDevelopmentPlan.query()
            .where('id', measurement.id)
            .where('assessment_id', assessment.id)
            .where('is_active', true)
            .first()
            
          if (existingPlan) {
            existingPlan.merge({
              measurement: measurement.text,
              actionSteps: measurement.actionSteps,
              responsibleResources: measurement.responsibleResources,
              startDate: measurement.startDate,
              completionDate: measurement.completionDate
            })
            await existingPlan.save()
            developmentPlan = existingPlan
          } else {
            // If existing plan not found, create new one
            developmentPlan = await IdpDevelopmentPlan.create({
              assessmentId: assessment.id,
              competencyId: competencyId,
              measurement: measurement.text,
              actionSteps: measurement.actionSteps,
              responsibleResources: measurement.responsibleResources,
              startDate: measurement.startDate,
              completionDate: measurement.completionDate,
              isActive: true
            })
          }
        } else {
          // Create new measurement
          developmentPlan = await IdpDevelopmentPlan.create({
            assessmentId: assessment.id,
            competencyId: competencyId,
            measurement: measurement.text,
            actionSteps: measurement.actionSteps,
            responsibleResources: measurement.responsibleResources,
            startDate: measurement.startDate,
            completionDate: measurement.completionDate,
            isActive: true
          })
        }
        
        await developmentPlan.load('competency')
        savedMeasurements.push(developmentPlan)
      }

      return response.ok({
        data: savedMeasurements,
        message: 'Development plan saved successfully'
      })
    } catch (error) {
      console.error('Error saving development plan:', error)
      return response.status(500).json({ error: 'Failed to save development plan' })
    }
  }

  /**
   * Delete development plan item
   */
  async deleteDevelopmentPlanItem({ auth, params, response }: HttpContext) {
    try {
      // Authenticate user using the API guard
      await auth.authenticate()
      
      const user = auth.user!
      const { id } = params

      // Get current active assessment
      const assessment = await IdpAssessment.query()
        .where('user_id', user.id)
        .where('is_active', true)
        .whereNull('deleted_at')
        .first()

      if (!assessment) {
        return response.status(404).json({ error: 'No active assessment found' })
      }

      // Find and delete development plan item
      const developmentPlan = await IdpDevelopmentPlan.query()
        .where('id', id)
        .where('assessment_id', assessment.id)
        .first()

      if (!developmentPlan) {
        return response.status(404).json({ error: 'Development plan item not found' })
      }

      await developmentPlan.delete()

      return response.ok({
        message: 'Development plan item deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting development plan item:', error)
      return response.status(500).json({ error: 'Failed to delete development plan item' })
    }
  }

  /**
   * Get user's IDP results
   */
  async getResults({ auth, response }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      
      const assessment = await IdpAssessment.query()
        .where('user_id', user.id)
        .where('is_active', true)
        .whereNull('deleted_at')
        .first()

      if (!assessment) {
        return response.status(404).json({ error: 'No active assessment found' })
      }

      const results = await IdpResult.query()
        .where('assessment_id', assessment.id)
        .where('is_active', true)
        .preload('competency')
        .orderBy('competency_id')
        .orderBy('created_at')

      return response.ok({
        data: results,
        message: 'Results retrieved successfully'
      })
    } catch (error) {
      console.error('Error fetching results:', error)
      return response.status(500).json({ error: 'Failed to fetch results' })
    }
  }

  /**
   * Save or update IDP result
   */
  async saveResult({ auth, request, response }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      
      const { 
        competencyId, 
        measurement, 
        actionSteps, 
        responsibleResources, 
        startDate, 
        completionDate,
        status = 'not_started',
        progress = 0,
        notes = null
      } = request.only([
        'competencyId', 'measurement', 'actionSteps', 'responsibleResources', 
        'startDate', 'completionDate', 'status', 'progress', 'notes'
      ])

      const assessment = await IdpAssessment.query()
        .where('user_id', user.id)
        .where('is_active', true)
        .whereNull('deleted_at')
        .first()

      if (!assessment) {
        return response.status(404).json({ error: 'No active assessment found' })
      }

      // Check if competency belongs to user's role
      const role = await IdpRole.query()
        .where('id', assessment.roleId)
        .preload('competencies', (query) => {
          query.where('id', competencyId).where('is_active', true)
        })
        .first()

      if (!role || role.competencies.length === 0) {
        return response.status(400).json({ error: 'Invalid competency for user role' })
      }

      // Check if result already exists for this competency
      const existingResult = await IdpResult.query()
        .where('assessment_id', assessment.id)
        .where('competency_id', competencyId)
        .where('is_active', true)
        .first()

      let result
      if (existingResult) {
        // Update existing result
        existingResult.merge({
          measurement,
          actionSteps,
          responsibleResources,
          startDate,
          completionDate,
          status,
          progress,
          notes
        })
        await existingResult.save()
        result = existingResult
      } else {
        // Create new result
        result = await IdpResult.create({
          assessmentId: assessment.id,
          competencyId: competencyId,
          measurement,
          actionSteps,
          responsibleResources,
          startDate,
          completionDate,
          status,
          progress,
          notes,
          isActive: true
        })
      }
      
      await result.load('competency')

      return response.ok({
        data: result,
        message: 'Result saved successfully'
      })
    } catch (error) {
      console.error('Error saving result:', error)
      return response.status(500).json({ error: 'Failed to save result' })
    }
  }

  /**
   * Delete IDP result
   */
  async deleteResult({ auth, params, response }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user!
      
      const assessment = await IdpAssessment.query()
        .where('user_id', user.id)
        .where('is_active', true)
        .whereNull('deleted_at')
        .first()

      if (!assessment) {
        return response.status(404).json({ error: 'No active assessment found' })
      }

      const result = await IdpResult.query()
        .where('id', params.id)
        .where('assessment_id', assessment.id)
        .where('is_active', true)
        .first()

      if (!result) {
        return response.status(404).json({ error: 'Result not found' })
      }

      // Soft delete
      result.isActive = false
      await result.save()

      return response.ok({
        message: 'Result deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting result:', error)
      return response.status(500).json({ error: 'Failed to delete result' })
    }
  }
}
