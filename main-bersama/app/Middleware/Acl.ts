import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Acl {
  public async handle ({ response, auth }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    let isVerified = auth.user?.is_verified
    if (isVerified){
      await next()
    } else {
      response.unauthorized({message: 'akun belum terverifikasi'})
    }
  }
}
