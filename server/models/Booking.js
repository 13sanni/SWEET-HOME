import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true, index: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    roomsBooked: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "Pay At Hotel",
    },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
