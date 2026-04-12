import { User } from "../models/user.models.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
export const verifyJWT = asyncHandler( async (req,res,next)=>{
    console.log("heygwg")
    try {
        const authHeader = req.header("Authorization");
        const token =req.cookies?.accessToken || (authHeader ? authHeader.replace("Bearer ", "") : null);
        if(!token ){
            throw new apiError(401,"Unauthorized request")
        }
        const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECURITY)
        const user=await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
        if(!user){
            //todo discuss about frontend
            throw new apiError(401,"Invalid Access Token")
        }
        req.user=user;
        next()
    } catch (error) {
        throw new apiError(401, "Invalid")
        
    }
})