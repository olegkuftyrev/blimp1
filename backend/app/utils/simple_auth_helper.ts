import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export class SimpleAuthHelper {
  /**
   * Authenticate user using simple token approach
   */
  static async authenticate({ request }: HttpContext): Promise<User | null> {
    try {
      const authHeader = request.header('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null
      }
      
      const token = authHeader.substring(7)
      
      // Find token in database (simple auth style)
      const db = await import('@adonisjs/lucid/services/db')
      const tokenRecord = await db.default
        .from('auth_access_tokens')
        .where('hash', token)
        .first()
      
      if (!tokenRecord) {
        return null
      }
      
      // Find user
      const user = await User.find(tokenRecord.tokenable_id)
      return user || null
    } catch (error) {
      console.error('SimpleAuthHelper: Authentication error:', error)
      return null
    }
  }

  /**
   * Require authentication or return 401
   */
  static async requireAuth(ctx: HttpContext): Promise<User> {
    const user = await this.authenticate(ctx)
    if (!user) {
      ctx.response.status(401).json({ error: 'Authentication required' })
      throw new Error('Unauthorized')
    }
    return user
  }
}

/**
 * Legacy function for compatibility
 */
export async function getAuthenticatedUser(ctx: HttpContext): Promise<User | null> {
  return SimpleAuthHelper.authenticate(ctx)
}