import vine from '@vinejs/vine'

export const createTodoValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    description: vine.string().optional().nullable(),
    status: vine.enum(['pending', 'in_progress', 'completed', 'cancelled'] as const).optional(),
    priority: vine.enum(['low', 'medium', 'high'] as const).optional(),
    scope: vine.enum(['user', 'store', 'both'] as const).optional(),
    dueDate: vine.date({ formats: ['iso'] }).optional().nullable(),
    assignedUserId: vine.number().positive().optional(),
    restaurantId: vine.number().positive().optional(),
    userId: vine.number().positive().optional(),
  })
)

export const updateTodoValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).optional(),
    description: vine.string().optional().nullable(),
    status: vine.enum(['pending', 'in_progress', 'completed', 'cancelled'] as const).optional(),
    priority: vine.enum(['low', 'medium', 'high'] as const).optional(),
    scope: vine.enum(['user', 'store', 'both'] as const).optional(),
    dueDate: vine.date({ formats: ['iso'] }).optional().nullable(),
    assignedUserId: vine.number().positive().optional(),
    restaurantId: vine.number().positive().optional(),
    userId: vine.number().positive().optional(),
  })
)

export const addTagsValidator = vine.compile(
  vine.object({
    names: vine.array(vine.string().trim().minLength(1)).optional(),
    ids: vine.array(vine.number().positive()).optional(),
  })
)

export const addChecklistItemValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1),
    sortOrder: vine.number().min(0).optional(),
  })
)

export const updateChecklistItemValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).optional(),
    isDone: vine.boolean().optional(),
    sortOrder: vine.number().min(0).optional(),
  })
)


