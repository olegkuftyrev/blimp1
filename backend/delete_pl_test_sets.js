import app from '@adonisjs/core/services/app'
import PLUserAnswer from './app/models/pl_user_answer.ts'
import PLTestSet from './app/models/pl_test_set.ts'

await app.booted(async () => {
  try {
    console.log('Deleting all P&L test sets and related answers...')

    // Delete all user answers first due to foreign key constraints
    const deletedAnswers = await PLUserAnswer.query().delete()
    console.log(`Deleted ${deletedAnswers} P&L user answers.`)

    // Then delete all test sets
    const deletedTestSets = await PLTestSet.query().delete()
    console.log(`Deleted ${deletedTestSets} P&L test sets.`)

    console.log('Successfully deleted all P&L test sets and answers.')
  } catch (error) {
    console.error('❌ Error deleting test sets:', error)
  } finally {
    await app.terminate()
  }
})
