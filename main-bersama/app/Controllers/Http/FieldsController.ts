import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Field from 'App/Models/Field'
import Venue from 'App/Models/Venue'
import FieldValidator from 'App/Validators/FieldValidator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class FieldsController {
  public async index ({response, request}: HttpContextContract) {
    let data = await Database.from('fields').select('*').where({
      venue_id: request.param('venue_id')
    })
    response.ok({message: 'loaded!', data})
  }

  public async create ({}: HttpContextContract) {

  }

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

  public async show ({response, request}: HttpContextContract) {
    let data = await Database.from('fields').select('*').where({
      id: request.param('id'),
      venue_id: request.param('venue_id')
    })

    response.ok({message: 'loaded', data})

  }

  public async edit ({}: HttpContextContract) {
  }

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
      response.badRequest({message: err})
    }
  }
}
