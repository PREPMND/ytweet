import mongoose from "mongoose";

import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * "Watch later" and "Not interested" are both just a set of video ids on the
 * user document, so one generic toggle covers both.
 *
 * $addToSet (not $push) makes the operation IDEMPOTENT: double-clicking the
 * menu item cannot insert the same id twice.
 */
const toggleListMembership = (field) =>
    asyncHandler(async (req, res) => {
        const { videoId } = req.params;

        if (!mongoose.isValidObjectId(videoId)) {
            throw new apiError(400, "`videoId` must be a valid id");
        }

        if (!(await Video.exists({ _id: videoId }))) {
            throw new apiError(404, "Video not found");
        }

        const user = await User.findById(req.user._id).select(field);
        const already = user[field].some((id) => id.toString() === videoId);

        await User.updateOne(
            { _id: req.user._id },
            already
                ? { $pull: { [field]: videoId } }
                : { $addToSet: { [field]: videoId } }
        );

        return res.status(200).json(
            new apiResponse(
                200,
                { videoId, [field]: !already },
                already ? "Removed" : "Added"
            )
        );
    });

const listField = (field) =>
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id)
            .select(field)
            .populate({
                path: field,
                select: "title thumbnail duration views createdAt owner",
                populate: { path: "owner", select: "username fullName avatar" },
            });

        // populate() silently drops ids whose video was deleted, so the list
        // self-heals instead of rendering holes.
        return res.status(200).json(new apiResponse(200, user?.[field] ?? [], "Fetched"));
    });

export const toggleWatchLater = toggleListMembership("watchLater");
export const getWatchLater = listField("watchLater");

export const toggleNotInterested = toggleListMembership("notInterested");

/** Ids only -- the feed uses this to filter client-side without a join. */
export const getLibraryIds = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("watchLater notInterested");

    return res.status(200).json(
        new apiResponse(
            200,
            {
                watchLater: (user?.watchLater ?? []).map(String),
                notInterested: (user?.notInterested ?? []).map(String),
            },
            "Library ids"
        )
    );
});
