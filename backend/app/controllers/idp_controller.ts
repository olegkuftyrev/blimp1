import type { HttpContext } from '@adonisjs/core/http'
import IdpRole from '#models/idp_role'
import IdpAssessment from '#models/idp_assessment'
import IdpAssessmentAnswer from '#models/idp_assessment_answer'
import { DateTime } from 'luxon'

export default class IdpController {
  /**
   * Get available roles for IDP assessment
   */
  async getRoles({ response }: HttpContext) {
    try {
      const roles = await IdpRole.query()
        .where('isActive', true)
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
      const currentUser = auth.user!
      
      const role = await IdpRole.query()
        .where('user_role', currentUser.role)
        .where('isActive', true)
        .preload('competencies', (competencyQuery) => {
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
        .where('isActive', true)
        .preload('competencies', (competencyQuery) => {
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
      const user = auth.user!
      
      // Find active assessment
      let assessment = await IdpAssessment.query()
        .where('userId', user.id)
        .where('isActive', true)
        .whereNull('deletedAt')
        .preload('role')
        .preload('answers', (answerQuery) => {
          answerQuery.preload('question')
        })
        .first()

      if (!assessment) {
        // Find role based on user's role
        const role = await IdpRole.query()
          .where('user_role', user.role)
          .where('isActive', true)
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
      const currentUser = auth.user!
      const targetUserId = parseInt(params.userId)
      
      if (isNaN(targetUserId)) {
        return response.status(400).json({ error: 'Invalid user ID' })
      }

      // Check if current user has permission to view this user's IDP
      // Same permissions as viewing team members
      if (currentUser.role === 'associate') {
        return response.status(403).json({ error: 'Insufficient permissions' })
      }

      let hasPermission = false
      
      if (currentUser.role === 'admin') {
        hasPermission = true
      } else {
        // For non-admin users, check if they share restaurants with the target user
        const UserRestaurant = await import('#models/user_restaurant')
        const currentUserRestaurants = await UserRestaurant.default.query()
          .where('user_id', currentUser.id)
          .select('restaurant_id')
        
        const targetUserRestaurants = await UserRestaurant.default.query()
          .where('user_id', targetUserId)
          .select('restaurant_id')
        
        const currentRestaurantIds = currentUserRestaurants.map(ur => ur.restaurantId)
        const targetRestaurantIds = targetUserRestaurants.map(ur => ur.restaurantId)
        
        // Check if they share any restaurants
        hasPermission = currentRestaurantIds.some(id => targetRestaurantIds.includes(id))
      }

      if (!hasPermission) {
        return response.status(403).json({ error: 'You can only view IDPs of your team members' })
      }

      // Find the target user
      const User = await import('#models/user')
      const targetUser = await User.default.find(targetUserId)
      
      if (!targetUser) {
        return response.status(404).json({ error: 'User not found' })
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
      const user = auth.user!
      const { answers } = request.only(['answers']) // { questionId: 'yes'|'no' }

      // Get current active assessment
      const assessment = await IdpAssessment.query()
        .where('userId', user.id)
        .where('isActive', true)
        .whereNull('deletedAt')
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
      const user = auth.user!

      // Get current active assessment
      const assessment = await IdpAssessment.query()
        .where('userId', user.id)
        .where('isActive', true)
        .whereNull('deletedAt')
        .preload('role', (roleQuery) => {
          roleQuery.preload('competencies', (competencyQuery) => {
            competencyQuery
              .where('isActive', true)
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
}
