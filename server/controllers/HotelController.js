import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const registerHotel = async(req,res)=>{
    try{
        const {name,address,contact,city} = req.body
        const owner = req.user._id

        //Check if the user is already registered 
        const hotel = await Hotel.findOne({owner})
        if(hotel){
            return res.json({success:true,message:"Hotel Already Registered"})
        }

        await Hotel.create({name,address,contact,owner,city})

        await User.findByIdAndUpdate(owner,{role:"HotelOwner"})

        res.json({success:true,message:"Hotel Registered"})
    } catch(error){
        res.json({success:false,message:error.message})
    }
}