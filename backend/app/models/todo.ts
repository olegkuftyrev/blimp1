import { BaseModel, column, belongsTo, manyToMany, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from './user.js'
import Restaurant from './restaurant.js'
import TodoTag from '#models/todo_tag'
import TodoChecklistItem from '#models/todo_checklist_item'

export default class Todo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare status: 'pending' | 'in_progress' | 'completed' | 'cancelled'

  @column()
  declare priority: 'low' | 'medium' | 'high'

  @column()
  declare scope: 'user' | 'store' | 'both'

  @column.dateTime()
  declare dueDate: DateTime | null

  @column()
  declare userId: number | null

  @column()
  declare restaurantId: number | null

  @column()
  declare assignedUserId: number | null

  @column()
  declare createdByUserId: number

  @column()
  declare updatedByUserId: number | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Restaurant)
  declare restaurant: BelongsTo<typeof Restaurant>

  @belongsTo(() => User, { foreignKey: 'assignedUserId' })
  declare assignedUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'createdByUserId' })
  declare createdByUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'updatedByUserId' })
  declare updatedByUser: BelongsTo<typeof User>

  @manyToMany(() => TodoTag, {
    pivotTable: 'todo_tag_pivot',
    pivotForeignKey: 'todo_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  declare tags: ManyToMany<typeof TodoTag>

  @hasMany(() => TodoChecklistItem)
  declare checklistItems: HasMany<typeof TodoChecklistItem>
}


