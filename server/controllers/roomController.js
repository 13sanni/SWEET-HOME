import Hotel from "../models/Hotel.js"
import {v2 as cloudinary} from "cloudinary"
import Room from "../models/Room.js"
import { populate } from "dotenv"
import Booking from "../models/Booking.js"

//API to create a new room for a hotel
export const createRoom = async(req,res)=>{
    try {
        const {roomType,pricePerNight,amenities} = req.body
        const hotel = await Hotel.findOne({owner:req.auth.userId})

        if(!hotel) return res.json({success:false, message:"No Hotel Found"})

        //upload images to cloudinary
        const uploadImages  = req.files.map(async(file)=>{
            const response = await cloudinary.uploader.upload(file.path)
            return response.secure_url
        })
        //wait for all uploads to complete
        const images = await Promise.all(uploadImages)

        await Room.create({
            hotel:hotel._id,
            roomType,
            pricePerNight:+pricePerNight,//same as Number(pricePerNight)
            amenities:JSON.parse(amenities),
            images,
        })
        res.json({success:true,message:"Room Created Successfully"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}


// API to get all rooms
export const getAllRooms = async(req,res)=>{
    try {
        const rooms = await Room.find({isAvailable:true}).populate({
            path:'hotel',
            populate:{
                path:'owner',
                select:'image'
            }
        }).sort({createdAt : -1})
        res.json({success:true,rooms})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}


export const getRooms = async (req, res) => {
    try {
        const { checkInDate, checkOutDate } = req.query;

        // Step 1: Get all rooms that are marked isAvailable: true
        let availableRooms = await Room.find({ isAvailable: true }).populate({
            path: 'hotel',
            populate: {
                path: 'owner',
                select: 'image'
            }
        }).sort({ createdAt: -1 });

        // If no date filters, return all available rooms
        if (!checkInDate || !checkOutDate) {
            return res.json({ success: true, rooms: availableRooms });
        }

        // Step 2: Convert strings to Date objects
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        // Step 3: Get all room IDs
        const allRoomIds = availableRooms.map(room => room._id);

        // Step 4: Find bookings that overlap with the desired range
        const overlappingBookings = await Booking.find({
            room: { $in: allRoomIds },
            $or: [
                {
                    checkInDate: { $lt: checkOut },
                    checkOutDate: { $gt: checkIn }
                }
            ]
        }).select('room');

        // Step 5: Extract room IDs that are booked
        const bookedRoomIds = overlappingBookings.map(b => b.room.toString());

        // Step 6: Filter out booked rooms
        const filteredRooms = availableRooms.filter(
            room => !bookedRoomIds.includes(room._id.toString())
        );

        return res.json({ success: true, rooms: filteredRooms });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};




//API to get all rooms for a specific hotel
export const getOwnerRooms = async(req,res)=>{
    try {
        const hotelData = await Hotel.findOne({owner : req.user._id})
        const rooms = await Room.find({hotel:hotelData._id.toString()}).populate("hotel")
        res.json({success:true,rooms})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

//API to toggle availability of a room
export const toggleRoomAvailability = async(req,res)=>{
    try {
        const {roomId} = req.body;
        const roomData = await Room.findById(roomId)
        roomData.isAvailable = !roomData.isAvailable
        await roomData.save()
        res.json({success:true,message:"Room Availability Updated"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

// ✅ API to get a single room by ID
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate({
      path: 'hotel',
      populate: {
        path: 'owner',
        select: 'image'
      }
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const filterRoomsByDate = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;

    const bookings = await Booking.find({
      room: roomId,
      checkInDate: { $lt: new Date(checkOutDate) },
      checkOutDate: { $gt: new Date(checkInDate) },
    });

    const isAvailable = bookings.length === 0;
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




