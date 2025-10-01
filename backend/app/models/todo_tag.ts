import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Todo from '#models/todo'

export default class TodoTag extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Todo, {
    pivotTable: 'todo_tag_pivot',
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'todo_id',
  })
  declare todos: ManyToMany<typeof Todo>
}


