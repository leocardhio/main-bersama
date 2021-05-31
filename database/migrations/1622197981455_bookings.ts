import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Bookings extends BaseSchema {
  protected tableName = 'bookings'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id', {primaryKey: true})
      table.dateTime('play_date_start').notNullable()
      table.string('play_date_end',45).notNullable()
      
      table
      .integer('user_id_booking')
      .unsigned()
      .references('users.id')
      .onDelete('CASCADE')
      .notNullable()

      table
      .integer('field_id')
      .unsigned()
      .references('fields.id')
      .onDelete('CASCADE')
      .notNullable()
      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
