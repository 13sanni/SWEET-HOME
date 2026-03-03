import mongoose from "mongoose";

const roomBookingSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    roomsBooked: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    roomType: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    totalRooms: { type: Number, required: true, min: 1 },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (val) => Array.isArray(val) && val.length <= 4,
        message: "A room can have at most 4 images",
      },
    },
    bookings: { type: [roomBookingSchema], default: [] },
    amenities: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

roomSchema.index({ hotel: 1, roomType: 1 });

const Room = mongoose.model("Room", roomSchema);

export default Room;
