import { User } from "../models/user.models.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler(async (req, res, next) => {
  console.log(">>> verifyJWT entered");

  const authHeader = req.header("Authorization");
  const token =
    req.cookies?.accessToken ||
    (authHeader ? authHeader.replace("Bearer ", "") : null);

  console.log("Token candidate:", token);

  if (!token) {
    console.log("No token found");
    throw new apiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECURITY);
    console.log("Decoded token:", decodedToken);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    console.log("User found:", user);

    if (!user) {
      throw new apiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    throw new apiError(401, "Invalid token");
  }
});