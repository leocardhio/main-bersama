import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Venue from 'App/Models/Venue'
import Database from '@ioc:Adonis/Lucid/Database'
import VenueValidator from 'App/Validators/VenueValidator'
import BookingValidator from 'App/Validators/BookingValidator'
import Field from 'App/Models/Field'

export default class VenuesController {
    /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues:
     *          get:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Venues
     *              summary: show all venues data for owner
     *              responses:
     *                  200:
     *                      description: 'success'

     *                  401:
     *                      description: 'access denied'
     */
    public async index({request, response} : HttpContextContract){
        let data = await Database.from('venues').select('*')
        response.ok({message: 'loaded!', data})
    }

    /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues:
     *          post:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Venues
     *              summary: create new venue for owner
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              $ref: '#definitions/Venue'
     *              responses:
     *                  401:
     *                      description: 'access denied'
     *                  201:
     *                      description: 'success'
     *                  400:
     *                      description: 'bad request body value'
     */
    public async store({request, response, auth}: HttpContextContract){
        try {
            let data = await request.validate(VenueValidator)
            let user = auth.user
            await user?.related('venues').create(data)
            response.created({message: 'venue telah didaftarkan'})
        } catch (err){
            response.badRequest({message: err})
        }
    }
    /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{id}:
     *          get:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Venues
     *              description: Showing list of bookings which `venues.id` is equal to `id` in query
     *              summary: show details of schedule in related venue for owner
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of venue
     *                  - in: query
     *                    name: play_date_start
     *                    type: string
     *                    format: date
     *                    required: false
     *                    description: playing date of certain data
     *              responses:
     *                  200:
     *                      description: 'success'
     *                  401:
     *                      description: 'access denied'
     */
    public async show({request, response}: HttpContextContract){
        let date = request.input('play_date_start',new Date().toISOString().substring(0,10))
        let data = await Database
        .from('venues')
        .join('fields', 'venues.id', '=', 'fields.venue_id')
        .join('bookings','fields.id','=','bookings.field_id')
        .where('play_date_start', 'like', `${date}%`)
        .where({
            'venues.id': request.param('id')
        })
        .select(['venues.id','venues.name','phone','address','user_id as owner_id','play_date_start','bookings.id','play_date_end','field_id'])
        response.ok({message: 'loaded!', data})
    
        
    }
    /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{id}/bookings:
     *          post:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Venues
     *              summary: booking venue for users with role user
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of venue
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              $ref: '#definitions/Booking'
     *              responses:
     *                  404:
     *                      description: 'field_id not found'
     *                  401:
     *                      description: 'access denied'
     *                  201:
     *                      description: 'new booking added'
     *                  400:
     *                      description: 'bad request body value'
     */
    public async booking ({request,response,auth}: HttpContextContract){
        try {
            let data = await request.validate(BookingValidator)
            let user = auth.user
            let field_data = await Field.findOrFail(data.field_id)
            let vid = field_data.venue_id

            if (request.param('id')!=vid){
                return response.notFound({message: `field dengan ID ${data.field_id} tidak terdapat pada venue tersebut`})
            }
            let data_booking= await user?.related('bookings').create({
                play_date_start: request.body().play_date_start,
                play_date_end: request.body().play_date_end,
                field_id: request.body().field_id
            })

            await user?.related('users_has_bookings').create({
                user_id: user.id,
                booking_id: data_booking?.id
            })
            response.created({message: 'booking berhasil dilakukan'})
        } catch (err){
            response.badRequest(err)
        }
    }
    /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{id}:
     *          put:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Venues
     *              summary: update venue's data for role owner if the user is the owner of the venue
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of venue
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              $ref: '#definitions/Venue'
     *              responses:
     *                  401:
     *                      description: 'access denied'
     *                  200:
     *                      description: 'success'
     *                  400:
     *                      description: 'bad request body value'
     */
    public async update ({request, response, auth}: HttpContextContract){
        try {
            let data = await request.validate(VenueValidator)
            let venue_related_data = await Venue.findOrFail(request.param('id'))
            if (venue_related_data.user_id === auth.user?.id){
                venue_related_data.name = data.name
                venue_related_data.address = data.address
                venue_related_data.phone = data.phone

                await venue_related_data.save()
                response.ok({message: 'updated!'})
            } else {
                response.unauthorized({message: 'akses ditolak'})
            }
        } catch (err) {
            response.badRequest(err)
        }
        

    }
}
