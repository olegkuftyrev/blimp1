import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('job_title', ['Hourly Associate', 'AM', 'Chef', 'SM/GM/TL', 'ACO', 'RDO'], {
          useNative: false,
          enumName: 'user_job_title_enum',
          existingType: false,
        })
        .notNullable()
        .defaultTo('Hourly Associate')
        .index()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('job_title')
    })
  }
}
