import type { HttpContext } from '@adonisjs/core/http'
import RolePerformance from '#models/role_performance'
import PerformanceItem from '#models/performance_item'
import UserPerformanceAnswer from '#models/user_performance_answer'

export default class RolesPerformancesController {
  /**
   * Get all available roles
   */
  async index({ response }: HttpContext) {
    try {
      const roles = await RolePerformance.query()
        .where('isActive', true)
        .orderBy('sortOrder', 'asc')
        .select(['id', 'name', 'displayName', 'description', 'trainingTimeFrame', 'sortOrder'])

      return response.ok({
        success: true,
        data: roles
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch roles',
        error: error.message
      })
    }
  }

  /**
   * Get role details with sections and items
   */
  async show({ params, response }: HttpContext) {
    try {
      const role = await RolePerformance.query()
        .where('id', params.id)
        .where('isActive', true)
        .preload('sections', (sectionsQuery) => {
          sectionsQuery
            .orderBy('sortOrder', 'asc')
            .preload('items', (itemsQuery) => {
              itemsQuery.orderBy('sortOrder', 'asc')
            })
        })
        .first()

      if (!role) {
        return response.notFound({
          success: false,
          message: 'Role not found'
        })
      }

      return response.ok({
        success: true,
        data: role
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch role details',
        error: error.message
      })
    }
  }

  /**
   * Get user's answers for a specific role
   */
  async getUserAnswers({ params, auth, response }: HttpContext) {
    try {
      // Ensure authentication context is populated
      await auth.authenticate()
      const user = auth.user
      if (!user) {
        return response.unauthorized({
          success: false,
          message: 'User not authenticated'
        })
      }
      
      const roleId = params.id

      // Get all items for this role
      const role = await RolePerformance.query()
        .where('id', roleId)
        .preload('sections', (sectionsQuery) => {
          sectionsQuery.preload('items')
        })
        .first()

      if (!role) {
        return response.notFound({
          success: false,
          message: 'Role not found'
        })
      }

      // Get all performance item IDs for this role
      const performanceItemIds: number[] = []
      role.sections.forEach(section => {
        section.items.forEach((item: any) => {
          performanceItemIds.push(item.id)
        })
      })

      // Get user's answers for these items
      const answers = await UserPerformanceAnswer.query()
        .where('userId', user.id)
        .whereIn('performanceItemId', performanceItemIds)

      // Create a map of item ID to answer
      const answersMap: Record<number, string> = {}
      answers.forEach(answer => {
        answersMap[answer.performanceItemId] = answer.answer
      })

      return response.ok({
        success: true,
        data: {
          roleId: roleId,
          userId: user.id,
          answers: answersMap
        }
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch user answers',
        error: error.message
      })
    }
  }

  /**
   * Save user's answer to a performance item
   */
  async saveAnswer({ request, auth, response }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user
      if (!user) {
        return response.unauthorized({
          success: false,
          message: 'User not authenticated'
        })
      }
      
      const { performanceItemId, answer } = request.only(['performanceItemId', 'answer'])

      if (!['yes', 'no'].includes(answer)) {
        return response.badRequest({
          success: false,
          message: 'Answer must be either "yes" or "no"'
        })
      }

      // Get the performance item to get its global question ID
      const performanceItem = await PerformanceItem.find(performanceItemId)
      if (!performanceItem) {
        return response.notFound({
          success: false,
          message: 'Performance item not found'
        })
      }

      // Find all performance items with the same global question ID
      const allSameQuestionItems = await PerformanceItem.query()
        .where('globalQuestionId', performanceItem.globalQuestionId)

      // Save/update answers for ALL items with the same global question ID
      for (const item of allSameQuestionItems) {
        await UserPerformanceAnswer.updateOrCreate(
          {
            userId: user.id,
            performanceItemId: item.id
          },
          {
            userId: user.id,
            performanceItemId: item.id,
            answer: answer,
            globalQuestionId: performanceItem.globalQuestionId
          }
        )
      }

      // Get the main answer for response
      const userAnswer = await UserPerformanceAnswer.query()
        .where('userId', user.id)
        .where('performanceItemId', performanceItemId)
        .first()

      return response.ok({
        success: true,
        data: {
          message: 'Answer saved successfully',
          answer: userAnswer,
          syncedGlobally: true,
          syncedItemsCount: allSameQuestionItems.length
        }
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to save answer',
        error: error.message
      })
    }
  }

  /**
   * Save multiple answers for a role (for manager editing)
   */
  async saveAnswersBulk({ params, request, auth, response }: HttpContext) {
    try {
      await auth.authenticate()
      const currentUser = auth.user
      if (!currentUser) {
        return response.unauthorized({
          success: false,
          message: 'User not authenticated'
        })
      }
      
      const { roleId } = params
      const { answers, targetUserId } = request.only(['answers', 'targetUserId'])

      // Check if current user has permission to edit this user's answers
      // Only allow if current user is admin or has management permissions
      if (currentUser.role === 'associate') {
        return response.forbidden({
          success: false,
          message: 'Insufficient permissions to edit user answers'
        })
      }

      // Use targetUserId if provided, otherwise use current user
      const userId = targetUserId || currentUser.id

      // Validate answers format
      if (!answers || typeof answers !== 'object') {
        return response.badRequest({
          success: false,
          message: 'Answers must be an object with itemId as keys and "yes"/"no" as values'
        })
      }

      const savedAnswers = []
      const errors = []

      // Process each answer
      for (const [itemIdStr, answer] of Object.entries(answers)) {
        try {
          const itemId = parseInt(itemIdStr)
          
          if (!['yes', 'no'].includes(answer as string)) {
            errors.push(`Invalid answer for item ${itemId}: ${answer}`)
            continue
          }

          // Get the performance item
          const performanceItem = await PerformanceItem.find(itemId)
          if (!performanceItem) {
            errors.push(`Performance item ${itemId} not found`)
            continue
          }

          // Verify the item belongs to the specified role
          const role = await RolePerformance.query()
            .where('id', roleId)
            .preload('sections', (sectionsQuery) => {
              sectionsQuery.preload('items')
            })
            .first()

          if (!role) {
            errors.push(`Role ${roleId} not found`)
            continue
          }

          // Check if item belongs to this role
          const itemBelongsToRole = role.sections.some(section => 
            section.items.some((item: any) => item.id === itemId)
          )

          if (!itemBelongsToRole) {
            errors.push(`Item ${itemId} does not belong to role ${roleId}`)
            continue
          }

          // Find all performance items with the same global question ID
          const allSameQuestionItems = await PerformanceItem.query()
            .where('globalQuestionId', performanceItem.globalQuestionId)

          // Save/update answers for ALL items with the same global question ID
          for (const item of allSameQuestionItems) {
            await UserPerformanceAnswer.updateOrCreate(
              {
                userId: userId,
                performanceItemId: item.id
              },
              {
                userId: userId,
                performanceItemId: item.id,
                answer: answer as 'yes' | 'no',
                globalQuestionId: performanceItem.globalQuestionId
              }
            )
          }

          savedAnswers.push({
            itemId,
            answer,
            syncedItemsCount: allSameQuestionItems.length
          })

        } catch (itemError) {
          errors.push(`Error processing item ${itemIdStr}: ${itemError.message}`)
        }
      }

      return response.ok({
        success: true,
        data: {
          message: `Saved ${savedAnswers.length} answers successfully`,
          savedAnswers,
          errors: errors.length > 0 ? errors : undefined,
          totalProcessed: Object.keys(answers).length
        }
      })

    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to save answers',
        error: error.message
      })
    }
  }

  /**
   * Get user's progress for a specific role
   */
  async getUserProgress({ params, auth, response }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user
      if (!user) {
        return response.unauthorized({
          success: false,
          message: 'User not authenticated'
        })
      }
      
      const roleId = params.id

      // Get role with all items
      const role = await RolePerformance.query()
        .where('id', roleId)
        .preload('sections', (sectionsQuery) => {
          sectionsQuery
            .orderBy('sortOrder', 'asc')
            .preload('items', (itemsQuery) => {
              itemsQuery.orderBy('sortOrder', 'asc')
            })
        })
        .first()

      if (!role) {
        return response.notFound({
          success: false,
          message: 'Role not found'
        })
      }

      // Count total items and yes answers
      let totalItems = 0
      let answeredItems = 0
      let yesAnswers = 0
      let noAnswers = 0

      const performanceItemIds: number[] = []
      role.sections.forEach(section => {
        section.items.forEach((item: any) => {
          totalItems++
          performanceItemIds.push(item.id)
        })
      })

      // Get user's answers
      const answers = await UserPerformanceAnswer.query()
        .where('userId', user.id)
        .whereIn('performanceItemId', performanceItemIds)

      answeredItems = answers.length
      yesAnswers = answers.filter(a => a.answer === 'yes').length
      noAnswers = answers.filter(a => a.answer === 'no').length

      // Progress is based on "Yes" answers, not total answered
      const progressPercentage = totalItems > 0 ? Math.round((yesAnswers / totalItems) * 100) : 0
      const yesPercentage = totalItems > 0 ? Math.round((yesAnswers / totalItems) * 100) : 0

      return response.ok({
        success: true,
        data: {
          roleId: roleId,
          roleName: role.displayName,
          totalItems,
          answeredItems,
          progressPercentage,
          yesAnswers,
          noAnswers,
          yesPercentage,
          isCompleted: yesAnswers === totalItems
        }
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch user progress',
        error: error.message
      })
    }
  }

  /**
   * Get user's overall progress across all roles
   */
  async getOverallProgress({ auth, response }: HttpContext) {
    try {
      await auth.authenticate()
      const user = auth.user
      if (!user) {
        return response.unauthorized({
          success: false,
          message: 'User not authenticated'
        })
      }

      const roles = await RolePerformance.query()
        .where('isActive', true)
        .preload('sections', (sectionsQuery) => {
          sectionsQuery.preload('items')
        })
        .orderBy('sortOrder', 'asc')

      const progressData = []

      for (const role of roles) {
        let totalItems = 0
        const performanceItemIds: number[] = []

        role.sections.forEach(section => {
          section.items.forEach((item: any) => {
            totalItems++
            performanceItemIds.push(item.id)
          })
        })

        const answers = await UserPerformanceAnswer.query()
          .where('userId', user.id)
          .whereIn('performanceItemId', performanceItemIds)

        const answeredItems = answers.length
        const yesAnswers = answers.filter(a => a.answer === 'yes').length
        const progressPercentage = totalItems > 0 ? Math.round((yesAnswers / totalItems) * 100) : 0

        progressData.push({
          roleId: role.id,
          roleName: role.displayName,
          totalItems,
          answeredItems,
          progressPercentage,
          yesAnswers,
          isCompleted: yesAnswers === totalItems
        })
      }

      // Calculate overall statistics
      const totalItemsAcrossRoles = progressData.reduce((sum, role) => sum + role.totalItems, 0)
      const totalAnsweredAcrossRoles = progressData.reduce((sum, role) => sum + role.answeredItems, 0)
      const totalYesAnswers = progressData.reduce((sum, role) => sum + role.yesAnswers, 0)
      // Overall progress should reflect mastery ("yes" answers), not just answered items
      const overallProgressPercentage = totalItemsAcrossRoles > 0 ? Math.round((totalYesAnswers / totalItemsAcrossRoles) * 100) : 0
      const completedRoles = progressData.filter(role => role.isCompleted).length

      return response.ok({
        success: true,
        data: {
          roles: progressData,
          overall: {
            totalRoles: roles.length,
            completedRoles,
            totalItemsAcrossRoles,
            totalAnsweredAcrossRoles,
            totalYesAnswers,
            overallProgressPercentage
          }
        }
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Failed to fetch overall progress',
        error: error.message
      })
    }
  }
}