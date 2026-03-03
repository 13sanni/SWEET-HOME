import { v2 as cloudinary } from "cloudinary";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

const isRangeOverlap = (newCheckIn, newCheckOut, existingCheckIn, existingCheckOut) =>
  newCheckIn < existingCheckOut && newCheckOut > existingCheckIn;

const getBookedCountForRange = (bookings, checkIn, checkOut) =>
  bookings.reduce((sum, booking) => {
    if (isRangeOverlap(checkIn, checkOut, booking.checkIn, booking.checkOut)) {
      return sum + booking.roomsBooked;
    }
    return sum;
  }, 0);

const toRoomWithAvailability = (roomDoc, checkIn = null, checkOut = null) => {
  const room = roomDoc.toObject();
  room.price = Number(room.price ?? room.pricePerNight ?? 0);
  room.totalRooms = Number(room.totalRooms ?? 1);
  room.isActive = room.isActive ?? room.isAvailable ?? true;
  const bookedCount =
    checkIn && checkOut ? getBookedCountForRange(room.bookings || [], checkIn, checkOut) : 0;
  room.availableRooms = Math.max((room.totalRooms || 0) - bookedCount, 0);
  return room;
};

const parseAmenities = (amenities) => {
  if (!amenities) return [];
  if (Array.isArray(amenities)) return amenities;

  if (typeof amenities === "string") {
    try {
      const parsed = JSON.parse(amenities);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

// POST /api/rooms
export const createRoom = async (req, res) => {
  try {
    const { hotelId, roomType, price, totalRooms, amenities } = req.body;

    const hotel = await Hotel.findOne({ _id: hotelId, owner: req.user._id });
    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found for this owner" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one room image is required" });
    }

    if (req.files.length > 4) {
      return res.status(400).json({ success: false, message: "Maximum 4 images allowed per room type" });
    }

    const duplicateRoomType = await Room.findOne({
      hotel: hotel._id,
      roomType: { $regex: `^${roomType}$`, $options: "i" },
      isActive: true,
    });

    if (duplicateRoomType) {
      return res.status(409).json({ success: false, message: "This room type already exists for the hotel" });
    }

    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });

    const images = await Promise.all(uploadImages);

    const room = await Room.create({
      hotel: hotel._id,
      roomType: roomType.trim(),
      price: Number(price),
      totalRooms: Number(totalRooms),
      amenities: parseAmenities(amenities),
      images,
    });

    return res.status(201).json({ success: true, message: "Room created", room });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/rooms and GET /api/rooms/all
export const getRooms = async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = req.query;
    const hasDateFilter = Boolean(checkInDate && checkOutDate);

    let checkIn = null;
    let checkOut = null;

    if (hasDateFilter) {
      checkIn = new Date(checkInDate);
      checkOut = new Date(checkOutDate);
      if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
        return res.status(400).json({ success: false, message: "Invalid check-in/check-out dates" });
      }
    }

    const roomDocs = await Room.find({})
      .populate({
        path: "hotel",
        populate: { path: "owner", select: "image username" },
      })
      .sort({ createdAt: -1 });

    const rooms = roomDocs
      .filter((room) => Boolean(room.hotel))
      .map((room) => toRoomWithAvailability(room, checkIn, checkOut))
      .filter((room) => room.isActive)
      .filter((room) => (!hasDateFilter ? true : room.availableRooms > 0));

    return res.status(200).json({ success: true, rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllRooms = getRooms;

// GET /api/rooms/owner
export const getOwnerRooms = async (req, res) => {
  try {
    const ownerHotels = await Hotel.find({ owner: req.user._id }).select("_id");
    if (!ownerHotels.length) {
      return res.status(200).json({ success: true, rooms: [] });
    }

    const hotelIds = ownerHotels.map((hotel) => hotel._id);
    const roomDocs = await Room.find({ hotel: { $in: hotelIds } }).populate("hotel").sort({ createdAt: -1 });
    const rooms = roomDocs.map((room) => toRoomWithAvailability(room));

    return res.status(200).json({ success: true, rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/rooms/toggle-availability
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;

    const room = await Room.findById(roomId).populate("hotel");
    if (!room || !room.hotel) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    if (room.hotel.owner !== req.user._id) {
      return res.status(403).json({ success: false, message: "Unauthorized room action" });
    }

    room.isActive = !(room.isActive ?? room.isAvailable ?? true);
    await room.save();

    return res.status(200).json({ success: true, message: "Room availability updated", room });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/rooms/:id
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate({
      path: "hotel",
      populate: { path: "owner", select: "image username" },
    });

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const checkInDate = req.query.checkInDate;
    const checkOutDate = req.query.checkOutDate;
    let roomResponse = room.toObject();

    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
        return res.status(400).json({ success: false, message: "Invalid check-in/check-out dates" });
      }
      roomResponse = toRoomWithAvailability(room, checkIn, checkOut);
    } else {
      roomResponse.availableRooms = room.totalRooms;
    }

    return res.status(200).json({ success: true, room: roomResponse });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/rooms/:id/availability
export const getRoomAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInDate, checkOutDate, roomsRequested = 1 } = req.query;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const roomsNeeded = Number(roomsRequested);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: "Invalid check-in/check-out dates" });
    }

    if (!Number.isFinite(roomsNeeded) || roomsNeeded <= 0) {
      return res.status(400).json({ success: false, message: "roomsRequested must be a positive number" });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const isActive = room.isActive ?? room.isAvailable ?? true;
    if (!isActive) {
      return res.status(409).json({ success: false, message: "Room type is inactive" });
    }

    const alreadyBooked = getBookedCountForRange(room.bookings || [], checkIn, checkOut);
    const availableRooms = Math.max(Number(room.totalRooms ?? 1) - alreadyBooked, 0);
    const canBook = availableRooms >= roomsNeeded;

    return res.status(200).json({
      success: true,
      availableRooms,
      requestedRooms: roomsNeeded,
      canBook,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/rooms/:id
export const deleteOwnerRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("hotel");
    if (!room || !room.hotel) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    if (room.hotel.owner !== req.user._id) {
      return res.status(403).json({ success: false, message: "Unauthorized room action" });
    }

    const now = new Date();
    const hasFutureBookings = (room.bookings || []).some((booking) => new Date(booking.checkOut) > now);
    if (hasFutureBookings) {
      return res.status(409).json({
        success: false,
        message: "Room has future bookings and cannot be deleted",
      });
    }

    await Booking.deleteMany({ room: room._id });
    await room.deleteOne();

    return res.status(200).json({ success: true, message: "Room deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
