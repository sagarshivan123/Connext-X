import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const isAuthenticated = async(req, res, next) => {
  try{
    const token = req.cookies?.token;  
   if(!token){
    return res.status(401).json({message:"Unauthorized, no token"});
   }
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.user=await User.findById(decoded.id).select("-password");

    if(!req.user){
      return res.status(401).json({message:"Unauthorized, user not found"});
    }
    next();
  }catch(error){
    return res.status(401).json({message:"Unauthorized, invalid token"});
  }
}