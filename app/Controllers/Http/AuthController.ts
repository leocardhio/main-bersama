import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import OtpCode from 'App/Models/OtpCode'
import UserValidator from 'App/Validators/UserValidator'
import Mail from '@ioc:Adonis/Addons/Mail'

export default class AuthController {
    /**
     * 
     * @swagger
     * paths:
     *      /api/v1/register:
     *          post:
     *              tags:
     *                  - Authentication
     *              description: Send an email of OTP code to be used in `otp-confirmation` endpoint
     *              summary: create new user
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              $ref: '#definitions/User'
     *              responses:
     *                  201:
     *                      description: 'success, check OTP code on your email'
     *                  422:
     *                      description: 'false entity on request'
     */
    public async register({ request, response }: HttpContextContract){
        try {
            const data = await request.validate(UserValidator)
            const newdata = await User.create(data)
            let otp = Math.floor(100000+Math.random()*900000)
            await Mail.send((message) => {
                message
                    .from('admin@mabar.com')
                    .to(data.email)
                    .subject('Main Bersama OTP Verification')
                    .htmlView('emails/otp_verification', {otp})
            })

            await OtpCode.create({
                user_id: newdata.id,
                otp_code: otp
            })

            response.created({message: 'register success, please verify your OTP code'})
        } catch (err) {
            response.unprocessableEntity({message: err})
        }
    }
    /**
     * 
     * @swagger
     * paths:
     *      /api/v1/login:
     *          post:
     *              security:
     *                  - bearerAuth: []
     *              tags:
     *                  - Authentication
     *              summary: login to user account
     *              description: Returning an bearer token which can be used to browse the website
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              type: object
     *                              properties:
     *                                  email:
     *                                      type: string
     *                                      format: email
     *                                  password:
     *                                      type: string
     *                              required:
     *                                  - email
     *                                  - password
     *              responses:
     *                  200:
     *                      description: 'login success'
     *                  417:
     *                      description: 'Account not verified'
     */
    public async login({request, response, auth}: HttpContextContract){
        const loginValidator = schema.create({
            email: schema.string({},[
                rules.email(),
                rules.exists({table: 'users', column: 'email'})
            ]),
            password: schema.string()
        })
        
        try {
            await request.validate({
                schema:loginValidator, 
                messages: {
                    'required': '{{ field }} tidak boleh kosong',
                    'email.exists': '{{ field }} tidak terdaftar'
                }})
            let email = request.body().email
            let password = request.body().password

            let userdata = await User.findBy('email', email)
            let isVerified = userdata?.$attributes.is_verified
            if (isVerified){
                let token = await auth.use('api').attempt(email, password)
                response.ok({message: 'login success!', token})
            } else {
                response.expectationFailed({message: 'tidak bisa login karena akun belum diverifikasi'})
            }
            
            
        } catch (err) {
            if (err.guard){
                response.notFound({message: err.message})
            } else {
                response.notFound({message: err.messages})
            }
        }
    }

    /**
     * 
     * @swagger
     * paths:
     *      /api/v1/otp-confirmation:
     *          post:
     *              tags:
     *                  - Authentication
     *              description: altering is_verified value in database to `true`
     *              summary: otp confirmation for certain email
     *              requestBody:
     *                  required: true
     *                  content:
     *                      application/x-www-form-urlencoded:
     *                          schema:
     *                              type: object
     *                              properties:
     *                                  email:
     *                                      type: string
     *                                      format: email
     *                                  otp_code:
     *                                      type: integer
     *                              required:
     *                                  - email
     *                                  - otp_code
     *              responses:
     *                  200:
     *                      description: 'account verified'
     *                  417:
     *                      description: 'wrong otp'
     *                  404:
     *                      description: 'email not found'
     */
    public async otpConfirmation({ request, response }:HttpContextContract){
        let email = request.body().email
        let otpraw = request.body().otp_code
        let otp = parseInt(otpraw)

        try {
            let userdata = await User.findByOrFail('email',email)
            let uid = userdata.$attributes.id
            let otpdata = await OtpCode.findOrFail(uid)
            let otpdb = otpdata?.$attributes.otp_code

            if (otp === otpdb){
                userdata.$attributes.is_verified = true
                await userdata.save()
                await otpdata?.delete()

                response.ok({message: 'akun telah terverifikasi!'})
            } else {
                response.expectationFailed({message: 'OTP code salah!'})
            }
        } catch (err){
            response.notFound(err.message)
        }
        
    }
}
