import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  createRoom,
  deleteOwnerRoom,
  getAllRooms,
  getOwnerRooms,
  getRoomAvailability,
  getRoomById,
  getRooms,
  toggleRoomAvailability,
} from "../controllers/roomController.js";
import {
  validateObjectIdParam,
  validateRoomPayload,
} from "../middleware/validationMiddleware.js";

const roomRouter = express.Router();

roomRouter.post("/", protect, upload.array("images", 4), validateRoomPayload, createRoom);
roomRouter.get("/", getRooms);
roomRouter.get("/all", getAllRooms);
roomRouter.get("/owner", protect, getOwnerRooms);
roomRouter.post("/toggle-availability", protect, toggleRoomAvailability);
roomRouter.get("/:id/availability", validateObjectIdParam("id"), getRoomAvailability);
roomRouter.get("/:id", validateObjectIdParam("id"), getRoomById);
roomRouter.delete("/:id", protect, validateObjectIdParam("id"), deleteOwnerRoom);

export default roomRouter;
