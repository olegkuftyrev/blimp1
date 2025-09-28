import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Таблица истории загрузок
    this.schema.createTable('pl_report_uploads', (table) => {
      table.increments('id')
      table.integer('pl_report_id').unsigned().references('id').inTable('pl_reports').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.string('file_name', 255)
      table.integer('file_size')
      table.string('upload_status', 20).defaultTo('success')
      table.text('error_message').nullable()
      table.jsonb('metadata').nullable() // дополнительная информация о файле
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
      
      // Индексы
      table.index(['pl_report_id'], 'idx_pl_uploads_report_id')
      table.index(['user_id'], 'idx_pl_uploads_user_id')
      table.index(['upload_status'], 'idx_pl_uploads_status')
      table.index(['created_at'], 'idx_pl_uploads_created_at')
    })

    // Таблица аудита изменений
    this.schema.createTable('pl_report_audit', (table) => {
      table.increments('id')
      table.integer('pl_report_id').unsigned().references('id').inTable('pl_reports').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.string('action', 50) // 'created', 'updated', 'deleted', 'viewed'
      table.jsonb('changes').nullable() // детали изменений
      table.string('ip_address', 45).nullable()
      table.string('user_agent', 500).nullable()
      table.timestamp('created_at').defaultTo(this.now())
      
      // Индексы
      table.index(['pl_report_id'], 'idx_pl_audit_report_id')
      table.index(['user_id'], 'idx_pl_audit_user_id')
      table.index(['action'], 'idx_pl_audit_action')
      table.index(['created_at'], 'idx_pl_audit_created_at')
    })

    // Таблица для кэширования агрегированных данных
    this.schema.createTable('pl_report_cache', (table) => {
      table.increments('id')
      table.string('cache_key', 255).unique()
      table.jsonb('data')
      table.timestamp('expires_at')
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
      
      // Индексы
      table.index(['cache_key'], 'idx_pl_cache_key')
      table.index(['expires_at'], 'idx_pl_cache_expires')
    })
  }

  async down() {
    this.schema.dropTable('pl_report_cache')
    this.schema.dropTable('pl_report_audit')
    this.schema.dropTable('pl_report_uploads')
  }
}