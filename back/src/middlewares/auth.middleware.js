import jwt from "jsonwebtoken";

import env from "../env.js";
import { User } from "../models/user.models.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function readToken(req) {
    const authHeader = req.header("Authorization");

    return (
        req.cookies?.accessToken ||
        (authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null)
    );
}

/** Hard gate: 401 unless a valid access token resolves to a real user. */
export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = readToken(req);

    if (!token) {
        throw new apiError(401, "Unauthorized request");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        // Distinguish "expired" from "tampered": the frontend interceptor
        // only needs to attempt a refresh for the former, and a clear message
        // makes that visible in the network tab.
        const message =
            error?.name === "TokenExpiredError" ? "Access token expired" : "Invalid access token";
        throw new apiError(401, message);
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
        throw new apiError(401, "Invalid access token");
    }

    req.user = user;
    next();
});

/**
 * Soft gate: attaches req.user when a valid token is present, but lets
 * anonymous requests through. Used for pages that render for everyone but
 * show extra state (e.g. `isSubscribed`) when signed in.
 */
export const optionalJWT = asyncHandler(async (req, res, next) => {
    const token = readToken(req);

    if (!token) return next();

    try {
        const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (user) req.user = user;
    } catch {
        // Ignore: an invalid token is simply treated as "not signed in".
    }

    next();
});
