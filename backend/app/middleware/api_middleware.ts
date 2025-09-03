import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ApiMiddleware {
  async handle(_ctx: HttpContext, next: NextFn) {
    /**
     * API middleware for additional processing if needed
     * CSRF is already disabled in config/shield.ts
     */
    
    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}