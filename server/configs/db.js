import mongoose from "mongoose";

const connectDB = async()=>{
    try{
        mongoose.connection.on('connected',()=>console.log('Databse Connected'))//event if the connection will be initiated
        await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`)
    } catch(error){
        console.log(error.message);
    }
}

export default connectDB