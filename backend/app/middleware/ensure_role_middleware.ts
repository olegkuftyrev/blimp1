import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { UserRole } from '#models/user'

export default class EnsureRoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, roles: UserRole[] = []) {
    await ctx.auth.authenticate()
    const user = ctx.auth.user!
    if (roles.length > 0 && !roles.includes(user.role)) {
      return ctx.response.forbidden({ error: 'Insufficient role' })
    }
    return next()
  }
}
