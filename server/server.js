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
import {
  CLERK_ENV_KEYS,
  REQUIRED_ENV_KEYS,
  getMissingEnvKeys,
  hasEnvKeys,
} from "./configs/validateEnv.js";


const app = express()
const allowedOrigins = [
"https://sweet-home-a-hotel-booking-platform-nzzl-e9zo7ufck.vercel.app/", // your frontend
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
const missingEnvKeys = getMissingEnvKeys(REQUIRED_ENV_KEYS);
if (missingEnvKeys.length) {
  console.warn(`[env] Missing keys: ${missingEnvKeys.join(", ")}`);
} else {
  console.log("[env] All required keys are present.");
}

if (hasEnvKeys(CLERK_ENV_KEYS)) {
  app.use(clerkMiddleware())//returns req.auth
} else {
  console.warn("Clerk keys are missing. Protected routes will return 401 until keys are configured.");
}

try {
  await connectDB()
} catch (error) {
  console.error("Failed to connect MongoDB:", error.message);
  process.exit(1);
}
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
