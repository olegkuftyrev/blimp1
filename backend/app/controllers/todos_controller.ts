import type { HttpContext } from '@adonisjs/core/http'
import Todo from '#models/todo'
import User from '#models/user'
import Restaurant from '#models/restaurant'
import AuditService from '#services/audit_service'
import AccessControlService from '#services/access_control_service'
import { createTodoValidator, updateTodoValidator, addTagsValidator, addChecklistItemValidator, updateChecklistItemValidator } from '#validators/todo_validators'

function parseBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'boolean') return value
  const str = String(value).toLowerCase()
  if (str === 'true') return true
  if (str === 'false') return false
  return undefined
}

export default class TodosController {
  private setSWRHeaders(response: HttpContext['response'], todo?: Todo) {
    if (todo) {
      const lastModified = todo.updatedAt?.toISO?.() || new Date().toISOString()
      const etag = `W/"todo-${todo.id}-${new Date(lastModified).getTime()}"`
      response.header('Last-Modified', lastModified)
      response.header('ETag', etag)
    }
    // Reasonable defaults; tuning possible later
    response.header('Cache-Control', 'no-cache')
  }
  async listUserTodos({ auth, request, params, response }: HttpContext) {
    await auth.authenticate()
    const currentUser = auth.user!
    const userId = Number(params.userId)
    if (!userId || Number.isNaN(userId)) {
      return response.badRequest({ error: 'Invalid userId' })
    }

    // Only owner can see their personal list; roles above associate can also view if same restaurant context is needed (skipped here for simplicity)
    if (currentUser.id !== userId && !['admin', 'ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }

    const { status, priority, scope, due_before, due_after, assigned_user_id, tag, search, page = 1, perPage = 20 } = request.qs()

    const query = Todo.query()
      .whereNull('deletedAt')
      .where((q) => {
        q.where('scope', 'user').orWhere('scope', 'both')
      })
      .andWhere('userId', userId)

    if (status) query.andWhere('status', status)
    if (priority) query.andWhere('priority', priority)
    if (scope) query.andWhere('scope', scope)
    if (due_before) query.andWhere('dueDate', '<=', new Date(due_before))
    if (due_after) query.andWhere('dueDate', '>=', new Date(due_after))
    if (assigned_user_id) query.andWhere('assignedUserId', Number(assigned_user_id))
    if (tag) query.whereHas('tags', (tq) => tq.where('name', String(tag)))
    if (search) query.andWhereILike('title', `%${String(search)}%`)

    const result = await query.preload('tags').preload('checklistItems').orderBy('createdAt', 'desc').paginate(Number(page), Number(perPage))
    this.setSWRHeaders(response)
    return response.ok(result)
  }

  async createUserTodo({ auth, request, params, response }: HttpContext) {
    await auth.authenticate()
    const currentUser = auth.user!
    const userId = Number(params.userId)
    if (!userId || Number.isNaN(userId)) {
      return response.badRequest({ error: 'Invalid userId' })
    }

    // owner or elevated roles
    if (currentUser.id !== userId && !['admin', 'ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }

    const payload = await request.validateUsing(createTodoValidator)

    const todo = await Todo.create({
      title: String(payload.title),
      description: payload.description ?? null,
      status: (payload.status ?? 'pending') as Todo['status'],
      priority: (payload.priority ?? 'medium') as Todo['priority'],
      scope: (payload.scope ?? 'user') as Todo['scope'],
      dueDate: payload.dueDate ? new Date(payload.dueDate) as any : null,
      userId: userId,
      restaurantId: payload.restaurantId ? Number(payload.restaurantId) : null,
      assignedUserId: payload.assignedUserId ? Number(payload.assignedUserId) : null,
      createdByUserId: currentUser.id,
      updatedByUserId: currentUser.id,
    })

    await AuditService.log({ actorUserId: currentUser.id, action: 'create', entityType: 'todo', entityId: todo.id, payload })
    this.setSWRHeaders(response, todo)
    return response.created(todo)
  }

  async updateUserTodo({ auth, request, params, response }: HttpContext) {
    await auth.authenticate()
    const currentUser = auth.user!
    const userId = Number(params.userId)
    const id = Number(params.id)
    if (!userId || Number.isNaN(userId) || !id || Number.isNaN(id)) {
      return response.badRequest({ error: 'Invalid params' })
    }

    const todo = await Todo.query().where('id', id).whereNull('deletedAt').first()
    if (!todo || todo.userId !== userId) return response.notFound({ error: 'Todo not found' })

    if (currentUser.id !== userId && !['admin', 'ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }

    const payload = await request.validateUsing(updateTodoValidator)

    todo.title = payload.title ?? todo.title
    todo.description = payload.description ?? todo.description
    todo.status = (payload.status ?? todo.status) as any
    todo.priority = (payload.priority ?? todo.priority) as any
    todo.scope = (payload.scope ?? todo.scope) as any
    todo.dueDate = payload.dueDate ? (new Date(payload.dueDate) as any) : todo.dueDate
    todo.assignedUserId = payload.assignedUserId !== undefined ? Number(payload.assignedUserId) : todo.assignedUserId
    todo.restaurantId = payload.restaurantId !== undefined ? Number(payload.restaurantId) : todo.restaurantId
    todo.updatedByUserId = currentUser.id
    await todo.save()

    await AuditService.log({ actorUserId: currentUser.id, action: 'update', entityType: 'todo', entityId: todo.id, payload })
    this.setSWRHeaders(response, todo)
    return response.ok(todo)
  }

  async deleteUserTodo({ auth, params, response }: HttpContext) {
    await auth.authenticate()
    const currentUser = auth.user!
    const userId = Number(params.userId)
    const id = Number(params.id)
    if (!userId || Number.isNaN(userId) || !id || Number.isNaN(id)) {
      return response.badRequest({ error: 'Invalid params' })
    }

    const todo = await Todo.query().where('id', id).whereNull('deletedAt').first()
    if (!todo || todo.userId !== userId) return response.notFound({ error: 'Todo not found' })

    if (currentUser.id !== userId && !['admin', 'ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }

    todo.deletedAt = new Date() as any
    await todo.save()
    await AuditService.log({ actorUserId: currentUser.id, action: 'delete', entityType: 'todo', entityId: todo.id })
    this.setSWRHeaders(response)
    return response.ok({ success: true })
  }

  async listStoreTodos({ auth, request, params, response }: HttpContext) {
    await auth.authenticate()
    const currentUser = auth.user!
    const restaurantId = Number(params.restaurantId)
    if (!restaurantId || Number.isNaN(restaurantId)) {
      return response.badRequest({ error: 'Invalid restaurantId' })
    }

    // Must be member of the restaurant to view
    const isMember = await AccessControlService.isMemberOfRestaurant(currentUser, restaurantId)
    if (!isMember) {
      return response.forbidden({ error: 'No access to this restaurant' })
    }
    const { status, priority, scope, due_before, due_after, assigned_user_id, tag, search, page = 1, perPage = 20 } = request.qs()

    const query = Todo.query()
      .whereNull('deletedAt')
      .where((q) => {
        q.where('scope', 'store').orWhere('scope', 'both')
      })
      .andWhere('restaurantId', restaurantId)

    if (status) query.andWhere('status', status)
    if (priority) query.andWhere('priority', priority)
    if (scope) query.andWhere('scope', scope)
    if (due_before) query.andWhere('dueDate', '<=', new Date(due_before))
    if (due_after) query.andWhere('dueDate', '>=', new Date(due_after))
    if (assigned_user_id) query.andWhere('assignedUserId', Number(assigned_user_id))
    if (tag) query.whereHas('tags', (tq) => tq.where('name', String(tag)))
    if (search) query.andWhereILike('title', `%${String(search)}%`)

    const result = await query.preload('tags').preload('checklistItems').orderBy('createdAt', 'desc').paginate(Number(page), Number(perPage))
    this.setSWRHeaders(response)
    return response.ok(result)
  }

  async createStoreTodo({ auth, request, params, response }: HttpContext) {
    await auth.authenticate()
    const currentUser = auth.user!
    const restaurantId = Number(params.restaurantId)
    if (!restaurantId || Number.isNaN(restaurantId)) {
      return response.badRequest({ error: 'Invalid restaurantId' })
    }

    // Only roles above associate can create store todos and must be members
    const isMember = await AccessControlService.isMemberOfRestaurant(currentUser, restaurantId)
    if (!isMember || ['associate', 'tablet'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }

    const payload = await request.validateUsing(createTodoValidator)

    const todo = await Todo.create({
      title: String(payload.title),
      description: payload.description ?? null,
      status: (payload.status ?? 'pending') as Todo['status'],
      priority: (payload.priority ?? 'medium') as Todo['priority'],
      scope: (payload.scope ?? 'store') as Todo['scope'],
      dueDate: payload.dueDate ? new Date(payload.dueDate) as any : null,
      userId: payload.userId ? Number(payload.userId) : null,
      restaurantId: restaurantId,
      assignedUserId: payload.assignedUserId ? Number(payload.assignedUserId) : null,
      createdByUserId: currentUser.id,
      updatedByUserId: currentUser.id,
    })

    await AuditService.log({ actorUserId: currentUser.id, action: 'create', entityType: 'todo', entityId: todo.id, payload })
    this.setSWRHeaders(response, todo)
    return response.created(todo)
  }

  async updateStoreTodo({ auth, request, params, response }: HttpContext) {
    await auth.authenticate()
    const currentUser = auth.user!
    const restaurantId = Number(params.restaurantId)
    const id = Number(params.id)
    if (!restaurantId || Number.isNaN(restaurantId) || !id || Number.isNaN(id)) {
      return response.badRequest({ error: 'Invalid params' })
    }

    const isMember = await AccessControlService.isMemberOfRestaurant(currentUser, restaurantId)
    if (!isMember || ['associate', 'tablet'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }

    const todo = await Todo.query().where('id', id).whereNull('deletedAt').first()
    if (!todo || todo.restaurantId !== restaurantId) return response.notFound({ error: 'Todo not found' })

    const payload = await request.validateUsing(updateTodoValidator)

    todo.title = payload.title ?? todo.title
    todo.description = payload.description ?? todo.description
    todo.status = (payload.status ?? todo.status) as any
    todo.priority = (payload.priority ?? todo.priority) as any
    todo.scope = (payload.scope ?? todo.scope) as any
    todo.dueDate = payload.dueDate ? (new Date(payload.dueDate) as any) : todo.dueDate
    todo.assignedUserId = payload.assignedUserId !== undefined ? Number(payload.assignedUserId) : todo.assignedUserId
    todo.userId = payload.userId !== undefined ? Number(payload.userId) : todo.userId
    todo.updatedByUserId = currentUser.id
    await todo.save()

    await AuditService.log({ actorUserId: currentUser.id, action: 'update', entityType: 'todo', entityId: todo.id, payload })
    this.setSWRHeaders(response, todo)
    return response.ok(todo)
  }

  async deleteStoreTodo({ auth, params, response }: HttpContext) {
    await auth.authenticate()
    const currentUser = auth.user!
    const restaurantId = Number(params.restaurantId)
    const id = Number(params.id)
    if (!restaurantId || Number.isNaN(restaurantId) || !id || Number.isNaN(id)) {
      return response.badRequest({ error: 'Invalid params' })
    }

    const isMember = await AccessControlService.isMemberOfRestaurant(currentUser, restaurantId)
    if (!isMember || ['associate', 'tablet'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }

    const todo = await Todo.query().where('id', id).whereNull('deletedAt').first()
    if (!todo || todo.restaurantId !== restaurantId) return response.notFound({ error: 'Todo not found' })

    todo.deletedAt = new Date() as any
    await todo.save()
    await AuditService.log({ actorUserId: currentUser.id, action: 'delete', entityType: 'todo', entityId: todo.id })
    this.setSWRHeaders(response)
    return response.ok({ success: true })
  }

  // =============================
  // Tags endpoints
  // =============================
  async getTags({ auth, params, response }: HttpContext) {
    await auth.authenticate()
    const id = Number(params.id)
    const todo = await Todo.query().where('id', id).whereNull('deletedAt').preload('tags').first()
    if (!todo) return response.notFound({ error: 'Todo not found' })
    this.setSWRHeaders(response, todo)
    return response.ok(todo.tags)
  }

  async addTags({ auth, request, params, response }: HttpContext) {
    await auth.authenticate()
    const currentUser = auth.user!
    const id = Number(params.id)
    const todo = await Todo.query().where('id', id).whereNull('deletedAt').first()
    if (!todo) return response.notFound({ error: 'Todo not found' })

    // Only owner (for user-scope) or roles above associate in the same restaurant for store-scope
    if (todo.scope !== 'store' && todo.userId !== currentUser.id && !['admin', 'ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }
    if ((todo.scope === 'store' || todo.scope === 'both') && ['associate', 'tablet'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }

    const { names = [], ids = [] } = await request.validateUsing(addTagsValidator) as { names?: string[]; ids?: number[] }

    const TodoTag = (await import('#models/todo_tag')).default
    const tagsToAttach: number[] = []

    if (Array.isArray(ids) && ids.length > 0) {
      tagsToAttach.push(...ids.map((x) => Number(x)))
    }
    if (Array.isArray(names) && names.length > 0) {
      for (const name of names) {
        const n = String(name).trim()
        if (!n) continue
        const existing = await TodoTag.findBy('name', n)
        if (existing) {
          tagsToAttach.push(existing.id)
        } else {
          const created = await TodoTag.create({ name: n })
          tagsToAttach.push(created.id)
        }
      }
    }

    if (tagsToAttach.length > 0) {
      await todo.related('tags').sync(tagsToAttach, false)
      await todo.load('tags')
    }

    await AuditService.log({ actorUserId: currentUser.id, action: 'tags_update', entityType: 'todo', entityId: todo.id, payload: { ids, names } })
    this.setSWRHeaders(response, todo)
    return response.ok(todo.tags)
  }

  async deleteTag({ auth, params, response }: HttpContext) {
    await auth.authenticate()
    const currentUser = auth.user!
    const id = Number(params.id)
    const tagId = Number(params.tagId)
    const todo = await Todo.query().where('id', id).whereNull('deletedAt').first()
    if (!todo) return response.notFound({ error: 'Todo not found' })
    if ((todo.scope === 'store' || todo.scope === 'both') && ['associate', 'tablet'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }
    if (todo.scope !== 'store' && todo.userId !== currentUser.id && !['admin', 'ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }
    await todo.related('tags').detach([tagId])
    await AuditService.log({ actorUserId: currentUser.id, action: 'tag_remove', entityType: 'todo', entityId: todo.id, payload: { tagId } })
    this.setSWRHeaders(response, todo)
    return response.ok({ success: true })
  }

  // =============================
  // Checklist endpoints
  // =============================
  async getChecklist({ auth, params, response }: HttpContext) {
    await auth.authenticate()
    const id = Number(params.id)
    const todo = await Todo.query().where('id', id).whereNull('deletedAt').preload('checklistItems', (q) => q.whereNull('deletedAt').orderBy('sortOrder', 'asc')).first()
    if (!todo) return response.notFound({ error: 'Todo not found' })
    this.setSWRHeaders(response, todo)
    return response.ok(todo.checklistItems)
  }

  async addChecklistItem({ auth, request, params, response }: HttpContext) {
    await auth.authenticate()
    const currentUser = auth.user!
    const id = Number(params.id)
    const todo = await Todo.query().where('id', id).whereNull('deletedAt').first()
    if (!todo) return response.notFound({ error: 'Todo not found' })
    if ((todo.scope === 'store' || todo.scope === 'both') && ['associate', 'tablet'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }
    if (todo.scope !== 'store' && todo.userId !== currentUser.id && !['admin', 'ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }

    const { title, sortOrder } = await request.validateUsing(addChecklistItemValidator)
    if (!title) return response.badRequest({ error: 'title is required' })

    const TodoChecklistItem = (await import('#models/todo_checklist_item')).default
    const item = await TodoChecklistItem.create({
      todoId: todo.id,
      title: String(title),
      isDone: false,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      deletedAt: null,
    })
    await AuditService.log({ actorUserId: currentUser.id, action: 'checklist_add', entityType: 'todo', entityId: todo.id, payload: item })
    this.setSWRHeaders(response, todo)
    return response.created(item)
  }

  async updateChecklistItem({ auth, request, params, response }: HttpContext) {
    await auth.authenticate()
    const currentUser = auth.user!
    const id = Number(params.id)
    const itemId = Number(params.itemId)
    const todo = await Todo.query().where('id', id).whereNull('deletedAt').first()
    if (!todo) return response.notFound({ error: 'Todo not found' })
    if ((todo.scope === 'store' || todo.scope === 'both') && ['associate', 'tablet'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }
    if (todo.scope !== 'store' && todo.userId !== currentUser.id && !['admin', 'ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }
    const TodoChecklistItem = (await import('#models/todo_checklist_item')).default
    const item = await TodoChecklistItem.query().where('id', itemId).where('todoId', todo.id).whereNull('deletedAt').first()
    if (!item) return response.notFound({ error: 'Checklist item not found' })

    const { title, isDone, sortOrder } = await request.validateUsing(updateChecklistItemValidator)
    if (title !== undefined) item.title = String(title)
    const isDoneParsed = parseBoolean(isDone)
    if (isDoneParsed !== undefined) item.isDone = isDoneParsed
    if (sortOrder !== undefined) item.sortOrder = Number(sortOrder)
    await item.save()

    await AuditService.log({ actorUserId: currentUser.id, action: 'checklist_update', entityType: 'todo', entityId: todo.id, payload: { itemId, title, isDone, sortOrder } })
    this.setSWRHeaders(response, todo)
    return response.ok(item)
  }

  async deleteChecklistItem({ auth, params, response }: HttpContext) {
    await auth.authenticate()
    const currentUser = auth.user!
    const id = Number(params.id)
    const itemId = Number(params.itemId)
    const todo = await Todo.query().where('id', id).whereNull('deletedAt').first()
    if (!todo) return response.notFound({ error: 'Todo not found' })
    if ((todo.scope === 'store' || todo.scope === 'both') && ['associate', 'tablet'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }
    if (todo.scope !== 'store' && todo.userId !== currentUser.id && !['admin', 'ops_lead', 'black_shirt'].includes(currentUser.role)) {
      return response.forbidden({ error: 'Forbidden' })
    }
    const TodoChecklistItem = (await import('#models/todo_checklist_item')).default
    const item = await TodoChecklistItem.query().where('id', itemId).where('todoId', todo.id).whereNull('deletedAt').first()
    if (!item) return response.notFound({ error: 'Checklist item not found' })
    item.deletedAt = new Date() as any
    await item.save()
    await AuditService.log({ actorUserId: currentUser.id, action: 'checklist_delete', entityType: 'todo', entityId: todo.id, payload: { itemId } })
    this.setSWRHeaders(response, todo)
    return response.ok({ success: true })
  }
}


