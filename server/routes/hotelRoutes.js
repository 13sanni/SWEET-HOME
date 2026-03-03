import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createHotel,
  deleteOwnerHotel,
  getOwnerHotels,
  updateOwnerHotel,
} from "../controllers/HotelController.js";
import {
  validateHotelPayload,
  validateObjectIdParam,
} from "../middleware/validationMiddleware.js";

const hotelRouter = express.Router();

hotelRouter.post("/", protect, validateHotelPayload, createHotel);
hotelRouter.get("/owner", protect, getOwnerHotels);
hotelRouter.put("/:id", protect, validateObjectIdParam("id"), validateHotelPayload, updateOwnerHotel);
hotelRouter.delete("/:id", protect, validateObjectIdParam("id"), deleteOwnerHotel);

export default hotelRouter;
