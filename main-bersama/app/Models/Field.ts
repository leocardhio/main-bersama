import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Booking from './Booking'

/**
 * @swagger
 * definitions:
 *    Field:
 *      type: object
 *      properties:
 *        name:
 *          type: stringh
 *        type:
 *          type: string
 *      required:
 *        -name
 *        -type
 */

export default class Field extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public type: string

  @column()
  public venue_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Booking,{
    foreignKey: 'field_id'
  })
  public bookings: HasMany<typeof Booking>
}
