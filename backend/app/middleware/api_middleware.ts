import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ApiMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Disable CSRF protection for API routes
     */
    ctx.request.csrf = false

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}