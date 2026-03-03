import mongoose from "mongoose";

const connectDB = async()=>{
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is missing");
    }

    mongoose.connection.on("connected", () => console.log("Database connected"));
    mongoose.connection.on("error", (error) => console.error("MongoDB error:", error.message));

    // Keep Mongo config minimal and use URI exactly as provided.
    await mongoose.connect(uri);
}

export default connectDB
