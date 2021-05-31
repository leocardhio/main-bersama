/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    Route.post('/register', 'AuthController.register').as('auth.register')
    Route.post('/login','AuthController.login').as('auth.login')
    Route.post('/otp-confirmation', 'AuthController.otpConfirmation').as('auth.otpconfirm')
    
    Route.group(() =>{
        Route.group(() => {
            Route.get('/venues', 'VenuesController.index').as('venues.index')
            Route.post('/venues', 'VenuesController.store').as('venues.store')
            Route.get('/venues/:id', 'VenuesController.show').as('venues.show')
            Route.put('/venues/:id', 'VenuesController.update').as('venues.update')
            Route.resource('venues.fields', 'FieldsController').apiOnly()
        }).middleware(['chkOwner','chkVerify'])

        Route.group(()=>{
            Route.post('/venues/:id/bookings', 'VenuesController.booking').as('venues.booking')
            Route.get('/schedule','BookingsController.schedule').as('booking.schedule')
            Route.get('/bookings','BookingsController.index').as('booking.index')
            Route.get('/bookings/:id','BookingsController.show').as('booking.show')
            Route.put('/bookings/:id/join','BookingsController.join').as('booking.join')
            Route.put('/bookings/:id/unjoin', 'BookingsController.unjoin').as('booking.unjoin')
        }).middleware(['chkUser','chkVerify'])
    }).middleware(['auth'])
}).prefix('/api/v1')