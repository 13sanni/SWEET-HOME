import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

export const createHotel = async (req, res) => {
  try {
    const { name, address, contact, city } = req.body;
    const owner = req.user._id;

    const hotel = await Hotel.create({ name, address, contact, city, owner });

    if (req.user.role !== "HotelOwner") {
      await User.findByIdAndUpdate(owner, { role: "HotelOwner" });
    }

    return res.status(201).json({ success: true, message: "Hotel created", hotel });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOwnerHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, hotels });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOwnerHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }

    if (hotel.owner !== req.user._id) {
      return res.status(403).json({ success: false, message: "Unauthorized hotel action" });
    }

    const { name, address, contact, city } = req.body;
    hotel.name = name;
    hotel.address = address;
    hotel.contact = contact;
    hotel.city = city;
    await hotel.save();

    return res.status(200).json({ success: true, message: "Hotel updated", hotel });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOwnerHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }

    if (hotel.owner !== req.user._id) {
      return res.status(403).json({ success: false, message: "Unauthorized hotel action" });
    }

    await Booking.deleteMany({ hotel: hotel._id });
    await Room.deleteMany({ hotel: hotel._id });
    await hotel.deleteOne();

    const hasAnyHotel = await Hotel.exists({ owner: req.user._id });
    if (!hasAnyHotel) {
      await User.findByIdAndUpdate(req.user._id, { role: "user" });
    }

    return res.status(200).json({ success: true, message: "Hotel deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
