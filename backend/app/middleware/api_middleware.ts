import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ApiMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * API middleware for additional processing if needed
     * CSRF is already disabled in config/shield.ts
     */

    // Add CORS headers
    ctx.response.header('Access-Control-Allow-Origin', '*')
    ctx.response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    ctx.response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    // Handle preflight requests
    if (ctx.request.method() === 'OPTIONS') {
      return ctx.response.status(200).send('')
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}