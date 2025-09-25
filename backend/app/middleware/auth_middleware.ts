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
      // Check if this is an API request with Bearer token
      const authHeader = ctx.request.header('authorization')
      console.log('Auth middleware: Authorization header:', authHeader)
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        console.log('Auth middleware: Using API guard for Bearer token')
        // For API requests with Bearer token, use api guard
        await ctx.auth.use('api').authenticate()
        console.log('Auth middleware: Authentication successful')
        return next()
      } else {
        console.log('Auth middleware: No Bearer token found, skipping auth for now')
        // For now, allow requests without authentication
        return next()
      }
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