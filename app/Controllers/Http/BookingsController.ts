import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import UserHasBooking from 'App/Models/UserHasBooking'

export default class BookingsController {
    /**
     * 
     * @swagger
     * paths:
     *      /api/v1/bookings:
     *          get:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Bookings
     *              summary: show all booking data for role user
     *              responses:
     *                  200:
     *                      description: 'success'
     *                  401:
     *                      description: 'access denied'
     */
    public async index({response}: HttpContextContract){
        let data = await Database.from('bookings').select('*')
        response.ok({message: 'ok', data})
    }

    /**
     * 
     * @swagger
     * paths:
     *      /api/v1/bookings/{id}:
     *          get:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Bookings
     *              description: Showing list of bookings which `bookings.id` is equal to `id` in query
     *              summary: show details of related booking for role user
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of booking
     *              responses:
     *                  200:
     *                      description: 'success'
     *                  401:
     *                      description: 'access denied'
     */
    public async show({response, request}: HttpContextContract){
        let data = await Database.from('bookings').select('*').where({
            id: request.param('id')
        })

        let data_pemain = await Database
        .from('bookings')
        .join('user_has_bookings','bookings.id','=','user_has_bookings.booking_id')
        .join('users','user_has_bookings.user_id','=','users.id')
        .select(['user_id','name'])
        
        data['daftar_pemain'] = data_pemain
        response.ok({message: 'loaded', data})        
    }

    /**
     * 
     * @swagger
     * paths:
     *      /api/v1/bookings/{id}/join:
     *          put:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Bookings
     *              summary: join on another existed booking for role user
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of booking
     *              responses:
     *                  401:
     *                      description: 'access denied'
     *                  201:
     *                      description: 'joined'
     */
    public async join({response, request, auth}:HttpContextContract){
        let userauth = auth.user

        await userauth?.related('users_has_bookings').create({
            user_id: userauth.id,
            booking_id: request.param('id')
        })

        response.created({message: 'berhasil join'})
    }

    /**
     * 
     * @swagger
     * paths:
     *      /api/v1/bookings/{id}/unjoin:
     *          put:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Bookings
     *              summary: unjoin existed joined booking for role user
     *              parameters:
     *                  - in: path
     *                    name: id
     *                    type: uint
     *                    required: true
     *                    description: ID of booking
     *              responses:
     *                  401:
     *                      description: 'access denied'
     *                  200:
     *                      description: 'unjoined'
     *                  404:
     *                      description: 'user not joined on related booking'
     */
    public async unjoin({response, request, auth}:HttpContextContract){
        let userauth = auth.user
        try{
            let data = await Database.from('user_has_bookings').where({
                user_id: userauth?.id,
                booking_id: request.param('id')
            }).delete()
            if (data.length==0){ //biarin aja, bener kok
                throw('Data tidak tersedia')
            }
            response.ok({message: 'unjoin berhasil'})
        } catch (err){
            response.notFound({message: err})
        }
    }

    /**
     * 
     * @swagger
     * paths:
     *      /api/v1/schedule:
     *          get:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Bookings
     *              summary: show all joined booking data of currently login user for role user
     *              responses:
     *                  200:
     *                      description: 'success'
     *                  401:
     *                      description: 'access denied'
     */
    public async schedule({ response}:HttpContextContract){
        let list_id_on = await Database.from('api_tokens').distinct('user_id')
        let users = await User.query().preload('users_has_bookings')
        let newdata: {user_id: number, schedule:UserHasBooking[]}[] = []
        list_id_on.forEach((uid)=>{
            for (let i=0;i<users.length;i++){
                if (users[i].id == uid.user_id){
                    newdata.push({
                        user_id: uid.user_id,
                        schedule: users[i].users_has_bookings
                    })
                }
            }
        })
        response.ok({message: 'loaded', data: newdata})
    }
}
