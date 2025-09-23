import type { HttpContext } from '@adonisjs/core/http'
import PLQuestion from '#models/pl_question'
import PLUserAnswer from '#models/pl_user_answer'
import PLTestSet from '#models/pl_test_set'
import User from '#models/user'

export default class PlQuestionsController {
  // Get all test sets for the user
  async getTestSets({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      
      const testSets = await PLTestSet.query()
        .where('user_id', user.id)
        .orderBy('created_at', 'desc')

      // For each test set, get the questions and user answers
      const testSetsWithDetails = await Promise.all(
        testSets.map(async (testSet) => {
          const questionIds = testSet.questionIdsArray
          const questions = await PLQuestion.query()
            .whereIn('id', questionIds)
            .orderBy('id')

          const userAnswers = await PLUserAnswer.query()
            .where('user_id', user.id)
            .where('pl_test_set_id', testSet.id)
            .preload('plQuestion')

          const answersMap = new Map()
          userAnswers.forEach(answer => {
            answersMap.set(answer.plQuestionId, answer)
          })

          const questionsWithAnswers = questions.map(question => ({
            ...question.toJSON(),
            userAnswer: answersMap.get(question.id) || null
          }))

          return {
            ...testSet.toJSON(),
            questions: questionsWithAnswers,
            progress: {
              total: questions.length,
              answered: userAnswers.length,
              correct: userAnswers.filter(a => a.isCorrect).length,
              percentage: questions.length > 0 ? (userAnswers.length / questions.length) * 100 : 0
            }
          }
        })
      )

      return response.json({
        success: true,
        data: testSetsWithDetails
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch test sets',
        error: error.message
      })
    }
  }

  // Get specific test set with questions
  async getTestSet({ params, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const testSet = await PLTestSet.query()
        .where('id', params.id)
        .where('user_id', user.id)
        .firstOrFail()

      const questionIds = testSet.questionIdsArray
      const questions = await PLQuestion.query()
        .whereIn('id', questionIds)
        .orderBy('id')

      const userAnswers = await PLUserAnswer.query()
        .where('user_id', user.id)
        .where('pl_test_set_id', testSet.id)
        .preload('plQuestion')

      const answersMap = new Map()
      userAnswers.forEach(answer => {
        answersMap.set(answer.plQuestionId, answer)
      })

      const questionsWithAnswers = questions.map(question => ({
        ...question.toJSON(),
        userAnswer: answersMap.get(question.id) || null
      }))

      return response.json({
        success: true,
        data: {
          ...testSet.toJSON(),
          questions: questionsWithAnswers,
          progress: {
            total: questions.length,
            answered: userAnswers.length,
            correct: userAnswers.filter(a => a.isCorrect).length,
            percentage: questions.length > 0 ? (userAnswers.length / questions.length) * 100 : 0
          }
        }
      })
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'Test set not found',
        error: error.message
      })
    }
  }

  // Create a new test set with random questions
  async createTestSet({ request, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const { name, description } = request.only(['name', 'description'])

      // Get all available questions
      const allQuestions = await PLQuestion.query().select('id')
      const questionIds = allQuestions.map(q => q.id)

      // Shuffle and take 10 random questions
      const shuffled = questionIds.sort(() => 0.5 - Math.random())
      const selectedQuestionIds = shuffled.slice(0, 10)

      if (selectedQuestionIds.length === 0) {
        return response.status(400).json({
          success: false,
          message: 'No questions available'
        })
      }

            const testSet = await PLTestSet.create({
              userId: user.id,
              name: name || `Practice Test Set - ${new Date().toLocaleDateString()}`,
              description: description || 'Random selection of P&L practice questions',
              questionIds: JSON.stringify(selectedQuestionIds),
              isDefault: false,
              isCompleted: false
            })

            // Update the name with the actual test set ID
            testSet.name = `Practice Test Set ${testSet.id} - ${new Date().toLocaleDateString()}`
            await testSet.save()

      // Load the selected questions
      const questions = await PLQuestion.query()
        .whereIn('id', selectedQuestionIds)
        .orderBy('id')

      return response.json({
        success: true,
        data: {
          ...testSet.toJSON(),
          questions: questions.map(q => ({ ...q.toJSON(), userAnswer: null })),
          progress: {
            total: questions.length,
            answered: 0,
            correct: 0,
            percentage: 0
          }
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to create test set',
        error: error.message
      })
    }
  }

  // Submit answer for a question in a specific test set
  async submitAnswer({ params, request, auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      const { userAnswer, testSetId } = request.only(['userAnswer', 'testSetId'])

      const question = await PLQuestion.findOrFail(params.id)
      
      // Check if answer is correct
      const isCorrect = userAnswer === question.correctAnswer

      // Check if user already answered this question in this test set
      const existingAnswer = await PLUserAnswer.query()
        .where('user_id', user.id)
        .where('pl_question_id', question.id)
        .where('pl_test_set_id', testSetId)
        .first()

      let answer
      if (existingAnswer) {
        // Update existing answer
        existingAnswer.merge({
          userAnswer,
          isCorrect
        })
        await existingAnswer.save()
        answer = existingAnswer
      } else {
        // Create new answer
        answer = await PLUserAnswer.create({
          userId: user.id,
          plQuestionId: question.id,
          plTestSetId: testSetId,
          userAnswer,
          isCorrect
        })
      }

      return response.json({
        success: true,
        data: {
          answer,
          question: question.toJSON(),
          isCorrect
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to submit answer',
        error: error.message
      })
    }
  }

  // Get test sets for a specific user (admin only)
  async getTestSetsForUser({ params, auth, response }: HttpContext) {
    try {
      const currentUser = await auth.authenticate()
      
      // Only admins can view other users' test sets
      if (currentUser.role !== 'admin') {
        return response.status(403).json({
          success: false,
          message: 'Only admin users can view other users\' test sets'
        })
      }

      const targetUserId = params.userId
      const testSets = await PLTestSet.query()
        .where('user_id', targetUserId)
        .orderBy('created_at', 'desc')

      // For each test set, get the questions and user answers
      const testSetsWithDetails = await Promise.all(
        testSets.map(async (testSet) => {
          const questionIds = testSet.questionIdsArray
          const questions = await PLQuestion.query()
            .whereIn('id', questionIds)
            .orderBy('id')

          const userAnswers = await PLUserAnswer.query()
            .where('user_id', targetUserId)
            .where('pl_test_set_id', testSet.id)
            .preload('plQuestion')

          const answersMap = new Map()
          userAnswers.forEach(answer => {
            answersMap.set(answer.plQuestionId, answer)
          })

          const questionsWithAnswers = questions.map(question => ({
            ...question.toJSON(),
            userAnswer: answersMap.get(question.id) || null
          }))

          return {
            ...testSet.toJSON(),
            questions: questionsWithAnswers,
            progress: {
              total: questions.length,
              answered: userAnswers.length,
              correct: userAnswers.filter(a => a.isCorrect).length,
              percentage: questions.length > 0 ? (userAnswers.length / questions.length) * 100 : 0
            }
          }
        })
      )

      return response.json({
        success: true,
        data: testSetsWithDetails
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch test sets for user',
        error: error.message
      })
    }
  }

  // Get stats for a specific user (admin only)
  async getStatsForUser({ params, auth, response }: HttpContext) {
    try {
      const currentUser = await auth.authenticate()
      
      // Only admins can view other users' stats
      if (currentUser.role !== 'admin') {
        return response.status(403).json({
          success: false,
          message: 'Only admin users can view other users\' stats'
        })
      }

      const targetUserId = params.userId
      const testSets = await PLTestSet.query().where('user_id', targetUserId)
      const userAnswers = await PLUserAnswer.query().where('user_id', targetUserId)
      
      const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length
      const totalAnswered = userAnswers.length
      const percentage = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0

      return response.json({
        success: true,
        data: {
          totalTestSets: testSets.length,
          totalAnswered,
          correctAnswers,
          incorrectAnswers: totalAnswered - correctAnswers,
          percentage
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch stats for user',
        error: error.message
      })
    }
  }

  // Get overall stats across all test sets
  async getStats({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      
      const testSets = await PLTestSet.query().where('user_id', user.id)
      const userAnswers = await PLUserAnswer.query().where('user_id', user.id)
      
      const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length
      const totalAnswered = userAnswers.length
      const percentage = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0

      return response.json({
        success: true,
        data: {
          totalTestSets: testSets.length,
          totalAnswered,
          correctAnswers,
          incorrectAnswers: totalAnswered - correctAnswers,
          percentage: Math.round(percentage * 100) / 100
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to get stats',
        error: error.message
      })
    }
  }


  // Reset all answers for a test set (admin only)
  async resetTestSet({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      
      // Check if user is admin
      if (user.role !== 'admin') {
        return response.status(403).json({
          success: false,
          message: 'Only admin users can reset test sets'
        })
      }

      const { testSetId } = request.params()
      
      // Verify test set exists
      const testSet = await PLTestSet.find(testSetId)
      if (!testSet) {
        return response.status(404).json({
          success: false,
          message: 'Test set not found'
        })
      }

      // Delete all user answers for this test set
      await PLUserAnswer.query()
        .where('pl_test_set_id', testSetId)
        .delete()

      // Mark test set as not completed
      testSet.isCompleted = false
      await testSet.save()

      return response.json({
        success: true,
        message: 'Test set reset successfully'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to reset test set',
        error: error.message
      })
    }
  }

  // Fill test set with random answers (admin only - for testing purposes)
  async fillRandomAnswers({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      
      // Check if user is admin
      if (user.role !== 'admin') {
        return response.status(403).json({
          success: false,
          message: 'Only admin users can fill random answers'
        })
      }

      const { testSetId } = request.params()
      
      // Verify test set exists
      const testSet = await PLTestSet.find(testSetId)
      if (!testSet) {
        return response.status(404).json({
          success: false,
          message: 'Test set not found'
        })
      }

      // Get all questions for this test set
      const questionIds = testSet.questionIdsArray
      const questions = await PLQuestion.query()
        .whereIn('id', questionIds)

      const answers = ['a1', 'a2', 'a3', 'a4']
      const results = []

      // Clear existing answers first
      await PLUserAnswer.query()
        .where('pl_test_set_id', testSetId)
        .delete()

      // Generate random answers for each question
      for (const question of questions) {
        const randomAnswer = answers[Math.floor(Math.random() * answers.length)]
        const isCorrect = randomAnswer === question.correctAnswer

        const userAnswer = await PLUserAnswer.create({
          userId: user.id,
          plQuestionId: question.id,
          plTestSetId: parseInt(testSetId),
          userAnswer: randomAnswer,
          isCorrect
        })

        results.push({
          questionId: question.id,
          questionIdStr: question.questionId,
          answer: randomAnswer,
          isCorrect
        })
      }

      // Mark test set as completed
      testSet.isCompleted = true
      await testSet.save()

      return response.json({
        success: true,
        message: 'Random answers filled successfully',
        data: {
          answersCount: results.length,
          correctAnswers: results.filter(r => r.isCorrect).length,
          results
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to fill random answers',
        error: error.message
      })
    }
  }

  // Fill test set with correct answers only (admin only - for testing purposes)
  async fillCorrectAnswers({ auth, request, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      
      // Check if user is admin
      if (user.role !== 'admin') {
        return response.status(403).json({
          success: false,
          message: 'Only admin users can fill correct answers'
        })
      }

      const { testSetId } = request.params()
      
      // Verify test set exists
      const testSet = await PLTestSet.find(testSetId)
      if (!testSet) {
        return response.status(404).json({
          success: false,
          message: 'Test set not found'
        })
      }

      // Get all questions for this test set
      const questionIds = testSet.questionIdsArray
      const questions = await PLQuestion.query()
        .whereIn('id', questionIds)

      const results = []

      // Clear existing answers first
      await PLUserAnswer.query()
        .where('pl_test_set_id', testSetId)
        .delete()

      // Generate correct answers for each question
      for (const question of questions) {
        const correctAnswer = question.correctAnswer
        const isCorrect = true // Always correct since we're using the correct answer

        const userAnswer = await PLUserAnswer.create({
          userId: user.id,
          plQuestionId: question.id,
          plTestSetId: parseInt(testSetId),
          userAnswer: correctAnswer,
          isCorrect
        })

        results.push({
          questionId: question.id,
          questionIdStr: question.questionId,
          answer: correctAnswer,
          isCorrect
        })
      }

      // Mark test set as completed
      testSet.isCompleted = true
      await testSet.save()

      return response.json({
        success: true,
        message: 'Correct answers filled successfully',
        data: {
          answersCount: results.length,
          correctAnswers: results.length, // All answers are correct
          results
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to fill correct answers',
        error: error.message
      })
    }
  }

  // Delete all test sets (admin only)
  async deleteAllTestSets({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      
      // Check if user is admin
      if (user.role !== 'admin') {
        return response.status(403).json({
          success: false,
          message: 'Only admin users can delete all test sets'
        })
      }

      // First delete all user answers
      const deletedAnswers = await PLUserAnswer.query().delete()
      
      // Then delete all test sets
      const deletedTestSets = await PLTestSet.query().delete()

      return response.json({
        success: true,
        message: 'All test sets and answers deleted successfully',
        data: {
          deletedTestSets,
          deletedAnswers
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to delete all test sets',
        error: error.message
      })
    }
  }
}
