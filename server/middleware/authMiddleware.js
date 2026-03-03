import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

//Middleware to check if the user is authenticated

const getPrimaryEmail = (clerkUser) => {
    const primary = clerkUser.emailAddresses?.find(
        (item) => item.id === clerkUser.primaryEmailAddressId
    );
    return primary?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || "";
};

const buildUsername = (clerkUser, email, userId) => {
    const fullName = `${clerkUser.firstName || ""}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ""}`.trim();
    if (fullName) return fullName;
    if (clerkUser.username) return clerkUser.username;
    if (email.includes("@")) return email.split("@")[0];
    return userId;
};

const ensureUserRecord = async (userId) => {
    let user = await User.findById(userId);
    if (user) return user;

    const clerkUser = await clerkClient.users.getUser(userId);
    const email = getPrimaryEmail(clerkUser);
    const image = clerkUser.imageUrl || "https://www.gravatar.com/avatar/?d=mp";
    const username = buildUsername(clerkUser, email, userId);

    user = await User.create({
        _id: userId,
        email: email || `${userId}@local.user`,
        username,
        image,
        recentSearchedCities: [],
    });

    return user;
};

export const protect = async(req,res,next)=>{
    try {
        const authData = typeof req.auth === "function" ? req.auth() : req.auth;
        const userId = authData?.userId;
        if(!userId){
            return res.status(401).json({success: false,message:"Not authenticated"});
        }

        const user = await ensureUserRecord(userId);
        req.user=user;
        next()
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
} 

