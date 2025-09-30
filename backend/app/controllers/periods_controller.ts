import type { HttpContext } from '@adonisjs/core/http'
import { PERIODS, getCurrentPeriod, getYtdPeriods } from '../utils/periods.js'

export default class PeriodsController {
  /**
   * Get all available periods
   */
  async index({ response }: HttpContext) {
    try {
      return response.ok({
        data: PERIODS,
        currentPeriod: getCurrentPeriod(),
        ytdPeriods: getYtdPeriods()
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to fetch periods',
        error: error.message
      })
    }
  }

  /**
   * Get current period
   */
  async current({ response }: HttpContext) {
    try {
      return response.ok({
        data: {
          currentPeriod: getCurrentPeriod(),
          ytdPeriods: getYtdPeriods()
        }
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to fetch current period',
        error: error.message
      })
    }
  }
}
