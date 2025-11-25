import transporter from "../configs/nodemailer.js"
import Booking from "../models/Booking.js"
import Hotel from "../models/Hotel.js"
import Room from "../models/Room.js"
import stripe from "stripe"




//API to create a new booking
//POST /api/bookings/book

export const createBooking = async(req,res)=>{
    try {
        const {room,checkInDate,checkOutDate,guests} = req.body
        const user=req.user._id

        const roomData = await Room.findById(room).populate("hotel")
        let totalPrice = roomData.pricePerNight

        //calculate totalPrice based on nights
        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)
        const timeDiff = checkOut.getTime() - checkIn.getTime()
        const nights = Math.ceil(timeDiff/(1000*3600*24))

        totalPrice*=nights
        const booking = await Booking.create({
            user,
            room,
            hotel:roomData.hotel._id,
            guests:+guests,
            checkInDate,
            checkOutDate,
            totalPrice
        })

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: "Booking Confirmation",
            html : `
                  <h2>Booking Confirmation</h2>
                  <p>Dear ${req.user.username},</p>
                  <p>Thank you for your booking. Here are the details:</p>
                  <ul>
                      <li><strong>Booking ID</strong>: ${booking._id}</li>
                      <li><strong>Hotel</strong>: ${roomData.hotel.name}</li>
                      <li><strong>Room Type</strong>: ${roomData.roomType}</li>
                      <li><strong>Location</strong>: ${roomData.hotel.address}</li>
                      <li><strong>Check-in Date</strong>: ${booking.checkInDate.toDateString()}</li>
                      <li><strong>Check-out Date</strong>: ${booking.checkOutDate.toDateString()}</li>
                      <li><strong>Booking Amount</strong>: ${process.env.CURRENCY || '$'} ${booking.totalPrice}</li>
                  </ul>
                  <p>We look forward to welcoming you!</p>
                  <p>If you have any questions or need assistance, feel free to contact us.</p>
                    <p>Best regards,</p>
                    <p>The Hotel Team</p>
        `
        }

        await transporter.sendMail(mailOptions)
        res.json({success:true,message:"Booking created successfully"})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:"Failed to create booking"})
    }
}

//API to get all bookings for a user 
//GET /api/bookings/user

export const getUserBookings = async(req,res)=>{
    try {
        const user = req.user._id
        const bookings = await Booking.find({user}).populate("room hotel").sort({createdAt:-1})
        res.json({success:true,bookings})
    } catch (error) {
        res.json({success:false,messsage:"Failed to fetch bookings"})
    }
}

//to get Bookings deatils for a particular hotel owner 
 export const getHotelBookings = async(req,res)=>{
    try {
        const hotel = await Hotel.findOne({owner:req.auth.userId})
        if(!hotel){
            return res.json({success:false,message:"No Hotel Found"})
        }
        const bookings = await Booking.find({hotel:hotel._id}).populate("room hotel user").sort({createdAt:-1})

        //total bookings
        const totalBookings = bookings.length
        //total revenue
        const totalRevenue = bookings.reduce((acc,booking)=>acc+booking.totalPrice,0)

        res.json({success:true,dashboardData: {totalBookings,totalRevenue,bookings}})
    } catch (error) {
        res.json({success:false,message:"Failed to fetch bookings"})
    }
 }


   export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id || req.user;

    const booking = await Booking.findById(bookingId)
      .populate('hotel', 'name')
      .populate('room', 'roomType');

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to cancel this booking" });
    }

    await Booking.findByIdAndDelete(bookingId);

    console.log("✅ Booking cancelled:", bookingId);

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: req.user.email,
      subject: "Booking Cancellation Confirmation",
      html: `
        <h2>Booking Cancelled</h2>
        <p>Dear ${req.user.username},</p>
        <p>Your booking has been successfully cancelled. Below are the cancelled booking details:</p>
        <ul>
          <li><strong>Booking ID:</strong> ${booking._id}</li>
          <li><strong>Hotel:</strong> ${booking.hotel?.name || 'N/A'}</li>
          <li><strong>Room Type:</strong> ${booking.room?.roomType || 'N/A'}</li>
          <li><strong>Check-in:</strong> ${new Date(booking.checkInDate).toDateString()}</li>
          <li><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toDateString()}</li>
          <li><strong>Total Amount:</strong> ${process.env.CURRENCY || '$'} ${booking.totalPrice}</li>
        </ul>
        <p>We hope to assist you with another stay in the future.</p>
        <p>Best regards,<br/>Tourix Team</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("📧 Cancellation email sent to", req.user.email);
    } catch (emailErr) {
      console.error("❌ Error sending cancellation email:", emailErr.message);
    }

    // ✅ Always respond to the client
    res.status(200).json({ success: true, message: "Booking cancelled successfully" });

  } catch (error) {
    console.error("🔥 Error cancelling booking:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};





 export const stripePayment = async(req,res)=>{
    try {
        const {bookingId} = req.body;
        const booking = await Booking.findById(bookingId)
        const roomData = await Room.findById(booking.room).populate("hotel")
        const totalPrice = booking.totalPrice

        const {origin} = req.headers;
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        const line_items = [
            {
                price_data:{
                    currency:"usd",
                    product_data:{
                        name: roomData.hotel.name,
                    },
                    unit_amount: totalPrice * 100, // Convert to cents
                },
                quantity: 1,
            }
        ]
        //create a checkout session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode:"payment",
            success_url:`${origin}/loader/my-bookings`,
            cancel_url:`${origin}/my-bookings`,
            metadata:{
                bookingId,
            }
        })
        res.json({success:true,url:session.url})

    } catch (error) {
        res.json({success:false,message:"Payment failed"})
    }
 }