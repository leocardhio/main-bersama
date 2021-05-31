import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  hasMany,
  HasMany,
} from '@ioc:Adonis/Lucid/Orm'
import UserHasBooking from './UserHasBooking'
import Booking from './Booking'
import Venue from './Venue'

/**
 * @swagger
 * definitions:
 *    User:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *        email:
 *          type: string
 *          format: email
 *        password:
 *          type: string
 *        role:
 *          type: string
 *      required:
 *        -name
 *        -email
 *        -password
 *        -role
 */
export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public role: string

  @column()
  public rememberMeToken?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column()
  public is_verified: boolean

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @hasMany(() => UserHasBooking, {
    foreignKey: 'user_id'
  })
  public users_has_bookings: HasMany<typeof UserHasBooking>

  @hasMany(() => Booking, {
    foreignKey: 'user_id_booking'
  })
  public bookings: HasMany<typeof Booking>

  @hasMany(() => Venue, {
    foreignKey: 'user_id'
  })
  public venues:  HasMany<typeof Venue>
}
