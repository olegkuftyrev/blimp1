import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    try {
      const authHeader = ctx.request.header('authorization')
      console.log('Auth middleware: attempting authentication')
      console.log('Guards:', options.guards || ['api'])
      console.log('Authorization header:', authHeader)
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7) // Remove 'Bearer ' prefix
        console.log('Extracted token:', token.substring(0, 20) + '...')
      }
      
      await ctx.auth.authenticateUsing(options.guards || ['api'], { loginRoute: this.redirectTo })
      console.log('Auth middleware: authentication successful')
      return next()
    } catch (error) {
      console.log('Auth middleware: authentication failed', error.message)
      // For API requests, return JSON error
      if (ctx.request.url().startsWith('/api/')) {
        return ctx.response.status(401).json({ error: 'Unauthorized' })
      }
      // For web requests, redirect to login
      return ctx.response.redirect(this.redirectTo)
    }
  }
}