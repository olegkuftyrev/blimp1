import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pl_reports'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Добавляем недостающие поля
      table.integer('year').defaultTo(2025)
      table.string('file_name').nullable()
      table.integer('file_size').nullable()
      table.string('upload_status', 20).defaultTo('success')
      table.text('error_message').nullable()
      table.integer('uploaded_by').nullable() // user_id who uploaded
      
      // Добавляем индексы для производительности
      table.index(['restaurant_id', 'period', 'year'], 'idx_pl_reports_restaurant_period_year')
      table.index(['period'], 'idx_pl_reports_period')
      table.index(['year'], 'idx_pl_reports_year')
      table.index(['upload_status'], 'idx_pl_reports_upload_status')
      
      // Добавляем ограничения
      table.unique(['restaurant_id', 'period', 'year'], 'unique_restaurant_period_year')
      table.check('year >= 2020 AND year <= 2030', [], 'check_year_range')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Удаляем добавленные поля
      table.dropColumn([
        'year', 'file_name', 'file_size', 'upload_status', 
        'error_message', 'uploaded_by'
      ])
      
      // Удаляем индексы
      table.dropIndex(['restaurant_id', 'period', 'year'], 'idx_pl_reports_restaurant_period_year')
      table.dropIndex(['period'], 'idx_pl_reports_period')
      table.dropIndex(['year'], 'idx_pl_reports_year')
      table.dropIndex(['upload_status'], 'idx_pl_reports_upload_status')
      
      // Удаляем ограничения
      table.dropUnique(['restaurant_id', 'period', 'year'], 'unique_restaurant_period_year')
      table.dropCheck('check_year_range')
    })
  }
}