import type { HttpContext } from '@adonisjs/core/http'
import UserPreference from '#models/user_preference'

export default class UserPreferencesController {
  /**
   * Get user preferences
   */
  async index({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      
      const preferences = await UserPreference.query()
        .where('userId', user.id)
        .select('preferenceKey', 'preferenceValue')
      
      const preferencesMap = preferences.reduce((acc, pref) => {
        acc[pref.preferenceKey] = pref.preferenceValue
        return acc
      }, {} as Record<string, any>)
      
      return response.json({
        success: true,
        data: preferencesMap
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch user preferences',
        error: error.message
      })
    }
  }

  /**
   * Save user preference
   */
  async store({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { key, value } = request.only(['key', 'value'])
      
      console.log('UserPreferencesController.store:', { key, value, userId: user.id })
      
      if (!key || value === undefined) {
        return response.status(400).json({
          success: false,
          message: 'Key and value are required'
        })
      }
      
      // Upsert preference
      const preference = await UserPreference.updateOrCreate(
        { userId: user.id, preferenceKey: key },
        { preferenceValue: value }
      )
      
      console.log('UserPreferencesController.store - saved:', preference.toJSON())
      
      return response.json({
        success: true,
        message: 'Preference saved successfully'
      })
    } catch (error) {
      console.error('UserPreferencesController.store error:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to save preference',
        error: error.message
      })
    }
  }

  /**
   * Get specific preference
   */
  async show({ auth, params, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { key } = params
      
      const preference = await UserPreference.query()
        .where('userId', user.id)
        .where('preferenceKey', key)
        .first()
      
      if (!preference) {
        return response.status(404).json({
          success: false,
          message: 'Preference not found'
        })
      }
      
      return response.json({
        success: true,
        data: {
          key: preference.preferenceKey,
          value: preference.preferenceValue
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch preference',
        error: error.message
      })
    }
  }

  /**
   * Delete specific preference
   */
  async destroy({ auth, params, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { key } = params
      
      const deleted = await UserPreference.query()
        .where('userId', user.id)
        .where('preferenceKey', key)
        .delete()
      
      if (deleted === 0) {
        return response.status(404).json({
          success: false,
          message: 'Preference not found'
        })
      }
      
      return response.json({
        success: true,
        message: 'Preference deleted successfully'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to delete preference',
        error: error.message
      })
    }
  }
}