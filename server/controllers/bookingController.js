import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import stripe from "stripe";

const isRangeOverlap = (newCheckIn, newCheckOut, existingCheckIn, existingCheckOut) =>
  newCheckIn < existingCheckOut && newCheckOut > existingCheckIn;

const getBookedCountForRange = (bookings, checkIn, checkOut) =>
  bookings.reduce((sum, booking) => {
    if (isRangeOverlap(checkIn, checkOut, booking.checkIn, booking.checkOut)) {
      return sum + booking.roomsBooked;
    }
    return sum;
  }, 0);

const parseBookingPayload = (body) => {
  const roomId = body.roomId || body.room;
  const checkIn = body.checkIn || body.checkInDate;
  const checkOut = body.checkOut || body.checkOutDate;
  const roomsRequested = Number(body.roomsRequested ?? 1);
  return { roomId, checkIn, checkOut, roomsRequested };
};

const sendBookingConfirmationEmail = async (booking, roomData, user) => {
  if (!process.env.SENDER_EMAIL || !user?.email) return;

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: user.email,
    subject: "Booking Confirmation",
    html: `
      <h2>Booking Confirmation</h2>
      <p>Dear ${user.username},</p>
      <p>Your booking has been confirmed.</p>
      <ul>
        <li><strong>Booking ID:</strong> ${booking._id}</li>
        <li><strong>Hotel:</strong> ${roomData.hotel?.name || "N/A"}</li>
        <li><strong>Room Type:</strong> ${roomData.roomType}</li>
        <li><strong>Rooms Booked:</strong> ${booking.roomsBooked}</li>
        <li><strong>Check-in:</strong> ${booking.checkInDate.toDateString()}</li>
        <li><strong>Check-out:</strong> ${booking.checkOutDate.toDateString()}</li>
        <li><strong>Amount:</strong> ${process.env.CURRENCY || "$"} ${booking.totalPrice}</li>
      </ul>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.warn("Booking email send failed:", error.message);
  }
};

// POST /api/bookings
export const createBooking = async (req, res) => {
  const session = await Booking.startSession();

  try {
    const { roomId, checkIn, checkOut, roomsRequested } = parseBookingPayload(req.body);
    const user = req.user._id;

    const parsedCheckIn = new Date(checkIn);
    const parsedCheckOut = new Date(checkOut);

    if (
      !roomId ||
      Number.isNaN(parsedCheckIn.getTime()) ||
      Number.isNaN(parsedCheckOut.getTime()) ||
      parsedCheckOut <= parsedCheckIn
    ) {
      return res.status(400).json({ success: false, message: "Invalid booking request" });
    }

    if (!Number.isFinite(roomsRequested) || roomsRequested <= 0) {
      return res.status(400).json({ success: false, message: "roomsRequested must be a positive number" });
    }

    let bookingDoc = null;
    let roomDataForEmail = null;

    await session.withTransaction(async () => {
      const roomData = await Room.findById(roomId).populate("hotel").session(session);
      const isActive = roomData ? roomData.isActive ?? roomData.isAvailable ?? true : false;
      if (!roomData || !isActive) {
        const error = new Error("Room is not available");
        error.statusCode = 404;
        throw error;
      }

      const overlappingRoomsBooked = getBookedCountForRange(
        roomData.bookings || [],
        parsedCheckIn,
        parsedCheckOut
      );
      const totalRooms = Number(roomData.totalRooms ?? 1);
      const pricePerNight = Number(roomData.price ?? roomData.pricePerNight ?? 0);
      const availableRooms = totalRooms - overlappingRoomsBooked;

      if (availableRooms < roomsRequested) {
        const error = new Error(`Only ${Math.max(availableRooms, 0)} room(s) available for selected dates`);
        error.statusCode = 409;
        throw error;
      }

      const nights = Math.ceil(
        (parsedCheckOut.getTime() - parsedCheckIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (nights <= 0) {
        const error = new Error("Invalid booking duration");
        error.statusCode = 400;
        throw error;
      }

      const totalPrice = pricePerNight * nights * roomsRequested;

      const created = await Booking.create(
        [
          {
            user,
            room: roomData._id,
            hotel: roomData.hotel._id,
            checkInDate: parsedCheckIn,
            checkOutDate: parsedCheckOut,
            roomsBooked: roomsRequested,
            totalPrice,
            paymentMethod: "Pay At Hotel",
            status: "confirmed",
          },
        ],
        { session }
      );
      bookingDoc = created[0];

      roomData.bookings.push({
        bookingId: bookingDoc._id,
        checkIn: parsedCheckIn,
        checkOut: parsedCheckOut,
        roomsBooked: roomsRequested,
      });
      await roomData.save({ session });
      roomDataForEmail = roomData;
    });

    if (!bookingDoc) {
      return res.status(500).json({ success: false, message: "Failed to create booking" });
    }

    await sendBookingConfirmationEmail(bookingDoc, roomDataForEmail, req.user);
    return res.status(201).json({ success: true, message: "Booking created successfully", booking: bookingDoc });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: error.message || "Failed to create booking" });
  } finally {
    await session.endSession();
  }
};

// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({ user }).populate("room hotel").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

// GET /api/bookings/hotel
export const getHotelBookings = async (req, res) => {
  try {
    const ownerHotels = await Hotel.find({ owner: req.user._id }).select("_id");
    if (!ownerHotels.length) {
      return res.status(200).json({
        success: true,
        dashboardData: { totalBookings: 0, totalRevenue: 0, bookings: [] },
      });
    }

    const hotelIds = ownerHotels.map((hotel) => hotel._id);
    const bookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate("room hotel user")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

    return res.status(200).json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

// DELETE /api/bookings/:id
export const cancelBooking = async (req, res) => {
  const session = await Booking.startSession();

  try {
    const bookingId = req.params.id;
    const userId = req.user._id;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to cancel this booking" });
    }

    await session.withTransaction(async () => {
      const removeByIdResult = await Room.updateOne(
        { _id: booking.room },
        { $pull: { bookings: { bookingId: booking._id } } },
        { session }
      );

      if (removeByIdResult.modifiedCount === 0) {
        await Room.updateOne(
          { _id: booking.room },
          {
            $pull: {
              bookings: {
                checkIn: booking.checkInDate,
                checkOut: booking.checkOutDate,
                roomsBooked: booking.roomsBooked,
              },
            },
          },
          { session }
        );
      }
      await Booking.findByIdAndDelete(booking._id, { session });
    });

    return res.status(200).json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    await session.endSession();
  }
};

// POST /api/bookings/stripe-payment
export const stripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized payment action" });
    }

    const roomData = await Room.findById(booking.room).populate("hotel");
    if (!roomData) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const totalPrice = booking.totalPrice;
    const origin = req.headers.origin || process.env.FRONTEND_URL || "http://localhost:5173";
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: { name: roomData.hotel?.name || roomData.roomType },
          unit_amount: totalPrice * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      metadata: { bookingId },
    });

    return res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Payment failed" });
  }
};
