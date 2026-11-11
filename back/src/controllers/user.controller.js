import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import env from "../env.js";
import { User } from "../models/user.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, destroyByUrl } from "../utils/cloudinary.js";
import {
    accessCookieOptions,
    refreshCookieOptions,
    clearCookieOptions,
} from "../utils/cookies.js";

const PUBLIC_FIELDS = "-password -refreshToken";

/* ------------------------------------------------------------------------- */
/* helpers                                                                   */
/* ------------------------------------------------------------------------- */

const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new apiError(404, "User not found while issuing tokens");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // Skip validation: we're only touching refreshToken, and running full
    // validators here would re-check required fields for no reason.
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

/* ------------------------------------------------------------------------- */
/* register / login / logout / refresh                                       */
/* ------------------------------------------------------------------------- */

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // `undefined?.trim() === ""` is FALSE, so the original check let missing
    // fields through and failed later as a 500 from Mongoose validation.
    const missing = Object.entries({ fullName, email, username, password })
        .filter(([, value]) => typeof value !== "string" || !value.trim())
        .map(([name]) => name);

    if (missing.length) {
        throw new apiError(400, `Missing required field(s): ${missing.join(", ")}`);
    }

    if (password.length < 6) {
        throw new apiError(400, "Password must be at least 6 characters");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new apiError(400, "Please provide a valid email address");
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existedUser = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existedUser) {
        throw new apiError(409, "A user with that email or username already exists");
    }

    // `req.files?.avatar[0]` only guards `req.files`; if `avatar` is absent it
    // still throws a TypeError. Every hop needs the optional chain.
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, "An avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath, "socialsphere/avatars");
    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath, "socialsphere/covers")
        : null;

    if (!avatar?.secure_url) {
        throw new apiError(502, "Avatar could not be uploaded, please try again");
    }

    const user = await User.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        username: normalizedUsername,
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || "",
    });

    const createdUser = await User.findById(user._id).select(PUBLIC_FIELDS);

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user");
    }

    // Log the user straight in: the frontend previously had to bounce to
    // /login after registering.
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .status(201)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json(new apiResponse(201, { user: createdUser }, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username?.trim() && !email?.trim()) {
        throw new apiError(400, "Username or email is required");
    }

    if (!password) {
        throw new apiError(400, "Password is required");
    }

    // Build the $or from present values only -- `{email: undefined}` matches
    // the first document that has no email field, which is a real auth bypass
    // risk in other codebases.
    const or = [];
    if (email?.trim()) or.push({ email: email.trim().toLowerCase() });
    if (username?.trim()) or.push({ username: username.trim().toLowerCase() });

    const user = await User.findOne({ $or: or });

    if (!user) {
        // Same message/status for "no such user" and "wrong password" so the
        // endpoint cannot be used to enumerate accounts.
        throw new apiError(401, "Invalid credentials");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select(PUBLIC_FIELDS);

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json(new apiResponse(200, { user: loggedInUser }, "User logged in successfully"));
});

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

    return res
        .status(200)
        .clearCookie("accessToken", clearCookieOptions)
        .clearCookie("refreshToken", clearCookieOptions)
        .json(new apiResponse(200, {}, "User logged out successfully"));
});

/**
 * Refresh rotation.
 *
 * The original implementation was dead on arrival: it referenced an
 * undefined `token` variable and an undefined `options` variable, so every
 * call threw a ReferenceError -> 500. Because the axios interceptor treats a
 * failed refresh as "logged out", sessions silently died the moment the
 * access token expired. This is the single most impactful fix in the repo.
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized request: no refresh token");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new apiError(401, "Refresh token is invalid or expired");
    }

    const user = await User.findById(decodedToken?._id);

    if (!user) {
        throw new apiError(401, "Invalid refresh token");
    }

    // Single-use rotation: the token must match the one on record. A replayed
    // (already-rotated) token is rejected.
    if (incomingRefreshToken !== user.refreshToken) {
        throw new apiError(401, "Refresh token is expired or already used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json(new apiResponse(200, {}, "Access token refreshed"));
});

/* ------------------------------------------------------------------------- */
/* profile                                                                   */
/* ------------------------------------------------------------------------- */

const getCurrentUser = asyncHandler(async (req, res) => {
    // verifyJWT already loaded the document (minus password/refreshToken),
    // so there is no reason to hit the database a second time.
    return res.status(200).json(new apiResponse(200, { user: req.user }, "Current user"));
});

const userById = asyncHandler(async (req, res) => {
    const userId = req.body?.userId || req.params?.userId || req.query?.userId;

    if (!userId) {
        throw new apiError(400, "`userId` is required");
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new apiError(400, "`userId` is not a valid id");
    }

    const userDetails = await User.findById(userId).select(PUBLIC_FIELDS);

    if (!userDetails) {
        throw new apiError(404, "User not found");
    }

    return res.status(200).json(new apiResponse(200, userDetails, "User found"));
});

/** Typeahead for starting a new conversation. */
const searchUsers = asyncHandler(async (req, res) => {
    const q = (req.query.q ?? "").trim();

    if (!q) {
        return res.status(200).json(new apiResponse(200, [], "No query"));
    }

    // Escape regex metacharacters so a user typing "a.*" cannot build a
    // pathological pattern (ReDoS / full-collection scan).
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const users = await User.find({
        _id: { $ne: req.user._id },
        $or: [
            { username: { $regex: safe, $options: "i" } },
            { fullName: { $regex: safe, $options: "i" } },
        ],
    })
        .select("username fullName avatar isOnline lastSeen")
        .limit(10);

    return res.status(200).json(new apiResponse(200, users, "Users found"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new apiError(400, "Both `oldPassword` and `newPassword` are required");
    }

    if (newPassword.length < 6) {
        throw new apiError(400, "New password must be at least 6 characters");
    }

    if (oldPassword === newPassword) {
        throw new apiError(400, "New password must be different from the old one");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new apiError(404, "User not found");
    }

    if (!(await user.isPasswordCorrect(oldPassword))) {
        throw new apiError(401, "Current password is incorrect");
    }

    // Assigning the plaintext is deliberate: the `pre("save")` hook hashes it.
    // `findByIdAndUpdate` would BYPASS that hook and store it in the clear.
    user.password = newPassword;
    await user.save();

    return res.status(200).json(new apiResponse(200, {}, "Password updated successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName?.trim() || !email?.trim()) {
        throw new apiError(400, "`fullName` and `email` are both required");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new apiError(400, "Please provide a valid email address");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailTaken = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user._id },
    });

    if (emailTaken) {
        throw new apiError(409, "That email is already in use");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullName: fullName.trim(), email: normalizedEmail } },
        { new: true, runValidators: true }
    ).select(PUBLIC_FIELDS);

    return res
        .status(200)
        .json(new apiResponse(200, { user }, "Account details updated successfully"));
});

/** Shared by the avatar and cover-image endpoints. */
const updateImageField = async (req, { field, folder, label }) => {
    // multer's `.single(name)` populates `req.file`, NOT `req.files`. The old
    // code read `req.files?.path`, which was always undefined -> every avatar
    // update returned 400.
    const localPath = req.file?.path;

    if (!localPath) {
        throw new apiError(400, `${label} file is required`);
    }

    const uploaded = await uploadOnCloudinary(localPath, folder);

    if (!uploaded?.secure_url) {
        throw new apiError(502, `${label} could not be uploaded`);
    }

    const previousUrl = req.user[field];

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { [field]: uploaded.secure_url } },
        { new: true }
    ).select(PUBLIC_FIELDS);

    // Don't leak orphaned assets in Cloudinary (the old code had a `//todo`).
    if (previousUrl && previousUrl !== uploaded.secure_url) {
        void destroyByUrl(previousUrl, "image");
    }

    return user;
};

const updateUserAvatar = asyncHandler(async (req, res) => {
    const user = await updateImageField(req, {
        field: "avatar",
        folder: "socialsphere/avatars",
        label: "Avatar",
    });

    return res.status(200).json(new apiResponse(200, { user }, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const user = await updateImageField(req, {
        field: "coverImage",
        folder: "socialsphere/covers",
        label: "Cover image",
    });

    return res
        .status(200)
        .json(new apiResponse(200, { user }, "Cover image updated successfully"));
});

/**
 * Channel page data: profile + subscriber count + whether *I* am subscribed.
 *
 * The old version read `req.body.username` only, but the route is
 * `GET /c/:username` -- a GET has no body, so it always 404'd. Accept both
 * the route param and the body so the existing POST /getchannel keeps working.
 */
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const username = (req.params.username ?? req.body?.username ?? "").trim().toLowerCase();

    if (!username) {
        throw new apiError(400, "`username` is required");
    }

    const viewerId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;

    const channel = await User.aggregate([
        { $match: { username } },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
            },
        },
        {
            $addFields: {
                subscriberCount: { $size: "$subscribers" },
                subscribedToCount: { $size: "$subscribedTo" },
                videoCount: { $size: "$videos" },
                isSubscribed: viewerId
                    ? { $in: [viewerId, "$subscribers.subscriber"] }
                    : false,
            },
        },
        {
            $project: {
                _id: 1,
                username: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                createdAt: 1,
                isOnline: 1,
                lastSeen: 1,
                subscriberCount: 1,
                subscribedToCount: 1,
                videoCount: 1,
                isSubscribed: 1,
            },
        },
    ]);

    if (!channel.length) {
        throw new apiError(404, "Channel does not exist");
    }

    return res
        .status(200)
        .json(new apiResponse(200, channel[0], "Channel details fetched successfully"));
});

/**
 * Watch history, newest first.
 *
 * The old aggregation passed `pipeline: { $lookup: ... }` -- an OBJECT where
 * MongoDB requires an ARRAY of stages -- and then indexed `user[0]` without
 * a guard. Both are fixed here.
 */
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                { $project: { username: 1, fullName: 1, avatar: 1 } },
                            ],
                        },
                    },
                    // $lookup always returns an array; flatten it to one doc.
                    { $addFields: { owner: { $first: "$owner" } } },
                ],
            },
        },
        { $project: { watchHistory: 1 } },
    ]);

    const history = user[0]?.watchHistory ?? [];

    // `watchHistory` is an array of ids in insertion order; we push newest to
    // the front in video.controller, so no extra sort is needed here.
    return res.status(200).json(new apiResponse(200, history, "Watch history fetched"));
});

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    userById,
    searchUsers,
};
