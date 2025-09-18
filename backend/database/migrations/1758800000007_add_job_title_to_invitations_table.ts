import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invitations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('job_title', ['Hourly Associate', 'AM', 'Chef', 'SM/GM/TL', 'ACO', 'RDO'], {
          useNative: false,
          enumName: 'invite_job_title_enum',
          existingType: false,
        })
        .nullable()
        .index()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('job_title')
    })
  }
}
