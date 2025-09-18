import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

/**
 * Helper function to authenticate user from Bearer token
 * Returns the authenticated user or null
 */
export async function getAuthenticatedUser(ctx: HttpContext): Promise<User | null> {
  try {
    const authHeader = ctx.request.header('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7)
    
    // Find token in database
    const tokenRecord = await db
      .from('auth_access_tokens')
      .where('hash', token)
      .first()
    
    if (!tokenRecord) {
      return null
    }
    
    // Find user
    const user = await User.find(tokenRecord.tokenable_id)
    return user
  } catch (error) {
    console.error('Auth helper error:', error)
    return null
  }
}
