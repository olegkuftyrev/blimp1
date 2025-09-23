import Database from '@adonisjs/lucid/services/db'

async function deleteTestSets() {
  try {
    console.log('Connecting to database...')
    
    // Delete all user answers first (due to foreign key constraints)
    console.log('Deleting all P&L user answers...')
    const deletedAnswers = await Database.from('pl_user_answers').delete()
    console.log(`✅ Deleted ${deletedAnswers[0]} user answers`)
    
    // Delete all test sets
    console.log('Deleting all P&L test sets...')
    const deletedTestSets = await Database.from('pl_test_sets').delete()
    console.log(`✅ Deleted ${deletedTestSets[0]} test sets`)
    
    console.log('🎉 Successfully deleted all P&L test data!')
    
  } catch (error) {
    console.error('❌ Error deleting test sets:', error.message)
  } finally {
    await Database.manager.closeAll()
    process.exit(0)
  }
}

deleteTestSets()