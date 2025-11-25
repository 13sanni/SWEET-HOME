import express from "express";
import "dotenv/config"
import cors from "cors"
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebHook from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoute.js";
import { stripeWebHooks } from "./controllers/stripeWebhooks.js";


const app = express()
const allowedOrigins = [
  "https://tourix-eosin.vercel.app", // your frontend
  "http://localhost:5173"            // for local development (optional)
];

// app.use(cors(
  
// )) //Enable cross origin resource sharing
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

//API to listen to stripe webhooks
app.post('/api/stripe', express.raw({type: 'application/json'}), stripeWebHooks)
app.use(express.json())//all the requests will be passed throough the json method
app.use(clerkMiddleware())//returns req.auth


await connectDB()
connectCloudinary()




//API to listen clerk web hook
app.use("/api/clerk",clerkWebHook)


app.get('/',(req,res)=>res.send("API is working enough"))

app.use('/api/user',userRouter)
app.use('/api/hotels',hotelRouter)
app.use('/api/rooms',roomRouter)
app.use('/api/bookings',bookingRouter)



const PORT=process.env.PORT || 3000

app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`))
