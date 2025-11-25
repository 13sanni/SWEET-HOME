import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    _id:{type:String,required:true},
    username:{type:String,required:true},
    email:{type:String,required:true},
    image:{type:String,required:true},
    role:{type:String,enum:["user","HotelOwner"],default:"user"},
    recentSearchedCities :[{type:String,required:true}],},{timestamps:true}
);

const User = mongoose.model("User",userSchema)//made the User model based on userSchema and then exported to use the user model anywhere

export default User