import { User } from "../models/user.models.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
console.log("Token candidate:");
export const verifyJWT = asyncHandler(async (req, res, next) => {
    console.log(">>> verifyJWT entered");

    const authHeader = req.header("Authorization");
    const token =
        req.cookies?.accessToken ||
        (authHeader ? authHeader.replace("Bearer ", "") : null);

    if (!token) {
        return next(new apiError(401, "Unauthorized request"));
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECURITY);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            return next(new apiError(401, "Invalid Access Token"));
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new apiError(401, error?.message || "Invalid token"));
    }
});