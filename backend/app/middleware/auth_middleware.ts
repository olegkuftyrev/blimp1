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
      // Use the default guard from config if none specified
      const guards = options.guards || ['api']
      
      // Use authenticate() method as per documentation
      await ctx.auth.authenticate()
      return next()
    } catch (error) {
      console.log('Auth middleware: authentication failed:', error.message)
      console.log('Auth middleware: Error stack:', error.stack)
      
      // For API requests, return JSON error
      if (ctx.request.url().startsWith('/api/') || ctx.request.accepts(['application/json'])) {
        return ctx.response.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        })
      }
      
      // For web requests, redirect to login
      return ctx.response.redirect(this.redirectTo)
    }
  }
}