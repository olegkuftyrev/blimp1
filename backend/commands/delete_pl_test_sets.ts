import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Database from '@adonisjs/lucid/services/db'

export default class DeletePlTestSets extends BaseCommand {
  static commandName = 'delete:pl-test-sets'
  static description = 'Delete all P&L test sets and user answers'

  static options: CommandOptions = {}

  async run() {
    try {
      this.logger.info('Deleting all P&L test sets and related answers...')

      // Delete all user answers first due to foreign key constraints
      const deletedAnswers = await Database.from('pl_user_answers').delete()
      this.logger.info(`Deleted ${deletedAnswers} P&L user answers.`)

      // Then delete all test sets
      const deletedTestSets = await Database.from('pl_test_sets').delete()
      this.logger.info(`Deleted ${deletedTestSets} P&L test sets.`)

      this.logger.success('Successfully deleted all P&L test sets and answers.')
    } catch (error) {
      this.logger.error('❌ Error deleting test sets:', error)
      console.error('Full error:', error)
    }
  }
}