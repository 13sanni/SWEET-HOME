import express from "express";
import {
  cancelBooking,
  createBooking,
  getHotelBookings,
  getUserBookings,
  stripePayment,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateBookingPayload,
  validateObjectIdParam,
} from "../middleware/validationMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post("/", protect, validateBookingPayload, createBooking);
// Backward-compatible alias
bookingRouter.post("/book", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/hotel", protect, getHotelBookings);
bookingRouter.delete("/:id", protect, validateObjectIdParam("id"), cancelBooking);
bookingRouter.post("/stripe-payment", protect, stripePayment);

export default bookingRouter;
