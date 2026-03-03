import mongoose from "mongoose";

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const parsePositiveNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

const parseNonNegativeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : null;
};

export const validateObjectIdParam = (paramName = "id") => (req, res, next) => {
  const id = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: `Invalid ${paramName}` });
  }
  return next();
};

export const validateHotelPayload = (req, res, next) => {
  const { name, address, contact, city } = req.body;

  if (!isNonEmptyString(name) || !isNonEmptyString(address) || !isNonEmptyString(contact) || !isNonEmptyString(city)) {
    return res.status(400).json({ success: false, message: "name, address, contact and city are required" });
  }

  return next();
};

export const validateRoomPayload = (req, res, next) => {
  const { hotelId, roomType, price, totalRooms } = req.body;
  const parsedPrice = parseNonNegativeNumber(price);
  const parsedTotalRooms = parsePositiveNumber(totalRooms);

  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    return res.status(400).json({ success: false, message: "Invalid hotelId" });
  }
  if (!isNonEmptyString(roomType)) {
    return res.status(400).json({ success: false, message: "roomType is required" });
  }
  if (parsedPrice === null) {
    return res.status(400).json({ success: false, message: "price must be a non-negative number" });
  }
  if (parsedTotalRooms === null) {
    return res.status(400).json({ success: false, message: "totalRooms must be a positive number" });
  }

  return next();
};

export const validateBookingPayload = (req, res, next) => {
  const { roomId, checkIn, checkOut, roomsRequested } = req.body;
  const parsedRoomsRequested = parsePositiveNumber(roomsRequested);

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    return res.status(400).json({ success: false, message: "Invalid roomId" });
  }

  const parsedCheckIn = new Date(checkIn);
  const parsedCheckOut = new Date(checkOut);

  if (Number.isNaN(parsedCheckIn.getTime()) || Number.isNaN(parsedCheckOut.getTime())) {
    return res.status(400).json({ success: false, message: "Invalid checkIn/checkOut date" });
  }

  if (parsedCheckOut <= parsedCheckIn) {
    return res.status(400).json({ success: false, message: "checkOut must be after checkIn" });
  }

  if (parsedRoomsRequested === null) {
    return res.status(400).json({ success: false, message: "roomsRequested must be a positive number" });
  }

  return next();
};
