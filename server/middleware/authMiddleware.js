import User from "../models/User.js";
import { requireAuth } from "@clerk/express";
import mongoose from "mongoose";

//Middleware to check if the user is authenticated

export const protect = async(req,res,next)=>{
    const{userId}=req.auth;
    if(!userId){
        res.json({success: false,message:"not authenticated"});
    }
      else{
        const user = await User.findById(userId)
        req.user=user;
        next()
    }
} 

