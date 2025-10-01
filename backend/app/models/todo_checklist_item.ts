import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Todo from '#models/todo'

export default class TodoChecklistItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare todoId: number

  @column()
  declare title: string

  @column()
  declare isDone: boolean

  @column()
  declare sortOrder: number

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Todo)
  declare todo: BelongsTo<typeof Todo>
}


