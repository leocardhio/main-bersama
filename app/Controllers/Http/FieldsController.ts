import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Field from 'App/Models/Field'
import Venue from 'App/Models/Venue'
import FieldValidator from 'App/Validators/FieldValidator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class FieldsController {
  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{venue_id}/fields:
     *          get:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Fields
     *              summary: show all fields where `venues.id = {venue_id}` for all user owner
     *              parameters:
     *                - in: path
     *                  name: venue_id
     *                  type: uint
     *                  required: true
     *                  description: containing id in database venues
     *              responses:
     *                  200:
     *                      description: 'success'

     *                  401:
     *                      description: 'access denied'
     */
  public async index ({response, request}: HttpContextContract) {
    let data = await Database.from('fields').select('*').where({
      venue_id: request.param('venue_id')
    })
    response.ok({message: 'loaded!', data})
  }

  public async create ({}: HttpContextContract) {

  }

  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{venue_id}/fields:
     *          post:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Fields
     *              summary: create new field for the owner of the venue
     *              parameters:
     *                - in: path
     *                  name: venue_id
     *                  type: uint
     *                  required: true
     *                  description: containing id in database venues
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              $ref: '#definitions/Field'
     *              responses:
     *                  401:
     *                      description: 'access denied'
     *                  201:
     *                      description: 'success'
     *                  400:
     *                      description: 'bad request body value'
     */
  public async store ({request, response, auth}: HttpContextContract) {
    try {
      let data = await request.validate(FieldValidator)
      let data_venue = await Venue.findByOrFail('id', request.param('venue_id'))
      if (auth.user?.id == data_venue.user_id){
        data_venue.related('fields').create(data)
        response.created({message: 'field telah didaftarkan'})
      } else {
        response.unauthorized({message: 'akses ditolak'})
      }
    } catch (err) {
      response.badRequest({message: err})
    }
  }

  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{venue_id}/fields/{id}:
     *          get:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Fields
     *              description: Showing list of fields which `venues.id` is equal to `venues_id` and `fields.id` equal to `id` in query
     *              summary: show details of fields for all users owner
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of field
     *                  - in: path
     *                    name: venue_id
     *                    type: uint
     *                    required: true
     *                    description: ID of venue
     *              responses:
     *                  200:
     *                      description: 'success'
     *                  401:
     *                      description: 'access denied'
     */
  public async show ({response, request}: HttpContextContract) {
    let data = await Database.from('fields').select('*').where({
      id: request.param('id'),
      venue_id: request.param('venue_id')
    })

    response.ok({message: 'loaded', data})

  }

  public async edit ({}: HttpContextContract) {
  }

   /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{venue_id}/fields/{id}:
     *          put:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Fields
     *              summary: update fields's data for role owner if the user is the owner of the venue
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of field
     *                  - in: path
     *                    name: venue_id
     *                    type: uint
     *                    required: true
     *                    description: ID of venue
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              $ref: '#definitions/Fields'
     *              responses:
     *                  401:
     *                      description: 'access denied'
     *                  200:
     *                      description: 'success'
     *                  400:
     *                      description: 'bad request body value'
     */
  public async update ({request,response,auth}: HttpContextContract) {
    try {
      let data = await request.validate(FieldValidator)
      let data_venue = await Venue.findByOrFail('id', request.param('venue_id'))
      let field_data = await Field.findOrFail(request.param('id'))
      if(auth.user?.id == data_venue.user_id){
        field_data.name = data.name
        field_data.type = data.type
        await field_data.save()
        response.ok({message: 'field updated!'})
      } else {
        response.unauthorized({message: 'akses ditolak'})
      }
    } catch (err) {
      response.badRequest({message: err})
    }
  }

  /**
     * 
     * @swagger
     * paths:
     *      /api/v1/venues/{venue_id}/fields/{id}:
     *          delete:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Fields
     *              summary: delete fields on venue if user owner is the owner of venue
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of field
     *                  - in: path
     *                    name: venue_id
     *                    type: uint
     *                    required: true
     *                    description: ID of venue
     *              responses:
     *                  200:
     *                      description: 'success'
     *                  401:
     *                      description: 'access denied'
     *                  404:
     *                      description: 'related data not found'
     */
  public async destroy ({request, response, auth}: HttpContextContract) {
    try {
      let data_venue = await Venue.findByOrFail('id', request.param('venue_id'))
      let field_data = await Field.findOrFail(request.param('id'))
      if(auth.user?.id == data_venue.user_id){
        await field_data.delete()
        response.ok({message: 'deleted!'})
      } else {
        response.unauthorized({message: 'akses ditolak'})
      }
    } catch (err) {
      response.notFound({message: err})
    }
  }
}
