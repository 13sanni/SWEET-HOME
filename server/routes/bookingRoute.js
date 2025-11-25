import express from "express"
import { createBooking, getHotelBookings, getUserBookings,stripePayment,cancelBooking} from "../controllers/bookingController.js"
import {protect} from "../middleware/authMiddleware.js"

const bookingRouter = express.Router()
bookingRouter.post('/book',protect,createBooking)
bookingRouter.get('/user',protect,getUserBookings)
bookingRouter.get('/hotel',protect,getHotelBookings)
bookingRouter.delete('/:id',protect,cancelBooking)
bookingRouter.post('/stripe-payment',protect,stripePayment)


export default bookingRouter