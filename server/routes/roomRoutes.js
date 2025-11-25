import express from "express"
import upload from "../middleware/uploadMiddleware.js"
import { protect } from "../middleware/authMiddleware.js"
import { createRoom, getOwnerRooms, getRooms, toggleRoomAvailability,getRoomById,getAllRooms,filterRoomsByDate} from "../controllers/roomController.js"

const roomRouter = express.Router()

roomRouter.post('/',upload.array("images",4),protect,createRoom)
roomRouter.get('/',getRooms)
roomRouter.get('/all',getAllRooms)
roomRouter.get('/owner',protect,getOwnerRooms)
roomRouter.post('/toggle-availability',protect,toggleRoomAvailability)
roomRouter.post('/byDate',protect,filterRoomsByDate)
roomRouter.get('/:id', getRoomById);

export default roomRouter