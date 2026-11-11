import mongoose from "mongoose";

import redis from "../redis/redis.js";
import { invalidate } from "../middlewares/cache.middleware.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary, destroyByUrl } from "../utils/cloudinary.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { SORT_MAP } from "../middlewares/validatePagination.middleware.js";
import elastic, { indexVideo, removeVideoFromIndex } from "../utils/elasticsearch.js";

const FEED_CACHE_PREFIX = "videos";

/* ------------------------------------------------------------------------- */
/* shared helpers                                                            */
/* ------------------------------------------------------------------------- */

/** "1h 5m" / "5m" / "42s" -- a derived display value, never stored. */
function formatDuration(seconds = 0) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (total < 60) return `${secs}s`;
    if (total < 3600) return `${minutes}m ${String(secs).padStart(2, "0")}s`;
    return `${hours}h ${minutes}m`;
}

/** Escape user input before it reaches a $regex, or it IS the regex. */
function escapeRegex(value = "") {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Supports a tiny query language in ?search=
 *   "react hooks"        -> text match on title/description
 *   "o/srijan hooks"     -> same, but only from owners whose username
 *                           matches "srijan"
 */
async function buildFilter(rawSearch = "") {
    const filter = { isPublished: true };

    const words = String(rawSearch).trim().split(/\s+/).filter(Boolean);
    const ownerToken = words.find((word) => word.startsWith("o/"));

    let owner = "";
    let search = rawSearch;

    if (ownerToken) {
        owner = ownerToken.slice(2);
        search = words.filter((word) => word !== ownerToken).join(" ");
    }

    if (owner.trim()) {
        const users = await User.find({
            username: { $regex: escapeRegex(owner), $options: "i" },
        }).select("_id");

        // An owner filter that matches nobody must return nothing, not
        // everything -- hence the explicit empty $in.
        filter.owner = { $in: users.map((user) => user._id) };
    }

    if (search.trim()) {
        const safe = escapeRegex(search.trim());
        filter.$or = [
            { title: { $regex: safe, $options: "i" } },
            { description: { $regex: safe, $options: "i" } },
        ];
    }

    return filter;
}

/** One pagination envelope for every list endpoint. */
function paginationMeta({ page, limit, total }) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
        currentPage: page,
        page,
        limit,
        totalVideos: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}

/* ------------------------------------------------------------------------- */
/* create                                                                    */
/* ------------------------------------------------------------------------- */

export const createVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title?.trim()) throw new apiError(400, "`title` is required");
    if (!description?.trim()) throw new apiError(400, "`description` is required");

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new apiError(400, "A video file is required");
    }

    // The Video schema marks `thumbnail` as required, so rejecting here gives
    // a 400 with a useful message instead of a 500 from Mongoose later.
    if (!thumbnailLocalPath) {
        throw new apiError(400, "A thumbnail image is required");
    }

    const videoUpload = await uploadOnCloudinary(videoLocalPath, "socialsphere/videos");
    const thumbnailUpload = await uploadOnCloudinary(
        thumbnailLocalPath,
        "socialsphere/thumbnails"
    );

    if (!videoUpload?.secure_url) {
        throw new apiError(502, "The video could not be uploaded");
    }

    const videoDoc = await Video.create({
        title: title.trim(),
        description: description.trim(),
        // Store the id, not the whole user document. Mongoose would cast it,
        // but passing a document here is how stale snapshots get embedded.
        owner: req.user._id,
        isPublished: true,
        videoFile: videoUpload.secure_url,
        duration: Math.floor(videoUpload.duration ?? 0),
        thumbnail: thumbnailUpload.secure_url,
    });

    void indexVideo(videoDoc);
    await invalidate(`${FEED_CACHE_PREFIX}:*`);

    return res
        .status(201)
        .json(new apiResponse(201, videoDoc, "Video published successfully"));
});

/* ------------------------------------------------------------------------- */
/* read                                                                      */
/* ------------------------------------------------------------------------- */

/**
 * Main feed. Uses aggregatePaginate so `totalPages` comes from a $facet
 * count rather than a second round trip.
 */
export const getVideos = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 6));
    const sort = SORT_MAP[req.query.sort] ? req.query.sort : "latest";
    const sortOption = SORT_MAP[sort];

    const cacheKey = `${FEED_CACHE_PREFIX}:${page}:${limit}:${sort}`;

    const cachedVideos = await redis.get(cacheKey).catch(() => null);
    if (cachedVideos) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(JSON.parse(cachedVideos));
    }

    const aggregate = Video.aggregate([
        { $match: { isPublished: true } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
            },
        },
        // preserveNull keeps a video visible if its owner row vanished,
        // instead of silently dropping it from the feed.
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                owner: 1,
            },
        },
    ]);

    const videos = await Video.aggregatePaginate(aggregate, {
        page,
        limit,
        sort: sortOption,
    });

    videos.docs = videos.docs.map((video) => ({
        ...video,
        durationFormatted: formatDuration(video.duration),
    }));

    const payload = { statusCode: 200, data: videos, message: "Videos fetched", success: true };

    res.setHeader("X-Cache", "MISS");
    res.status(200).json(payload);

    // Write the cache after responding so the client never waits on Redis.
    redis
        .set(cacheKey, JSON.stringify(payload), { EX: 300 })
        .catch((err) => console.warn(`[cache] feed write failed: ${err.message}`));
});

/** Single video. Also bumps `views` and the viewer's watch history. */
export const getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        throw new apiError(400, "That is not a valid video id");
    }

    const video = await Video.findById(id).populate("owner", "username fullName avatar");

    // The null check has to come BEFORE anything touches `video`; the old
    // code assigned `video.durationFormatted` first and crashed with
    // "Cannot set property of null" for every missing id.
    if (!video) {
        throw new apiError(404, "Video not found");
    }

    // Fire-and-forget: a view counter must never slow down or fail playback.
    Video.updateOne({ _id: video._id }, { $inc: { views: 1 } }).catch(() => {});

    if (req.user?._id) {
        // $pull then $push keeps the most recent watch at the front without
        // duplicating entries. Two writes because Mongo cannot do both in one.
        User.updateOne({ _id: req.user._id }, { $pull: { watchHistory: video._id } })
            .then(() =>
                User.updateOne(
                    { _id: req.user._id },
                    { $push: { watchHistory: { $each: [video._id], $position: 0, $slice: 100 } } }
                )
            )
            .catch(() => {});
    }

    const payload = {
        ...video.toObject(),
        views: (video.views ?? 0) + 1,
        durationFormatted: formatDuration(video.duration),
    };

    return res.status(200).json(new apiResponse(200, payload, "Video fetched"));
});

/** Videos belonging to one owner. Replaces the old untyped `any` handler. */
export const getVideosByOwner = asyncHandler(async (req, res) => {
    const owner = req.body?.owner || req.query?.owner || req.params?.owner;

    if (!mongoose.isValidObjectId(owner)) {
        throw new apiError(400, "`owner` must be a valid user id");
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 12));

    const [videos, total] = await Promise.all([
        Video.find({ owner })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Video.countDocuments({ owner }),
    ]);

    return res.status(200).json(
        new apiResponse(
            200,
            {
                videos: videos.map((video) => ({
                    ...video,
                    durationFormatted: formatDuration(video.duration),
                })),
                ...paginationMeta({ page, limit, total }),
            },
            "Owner videos fetched"
        )
    );
});

/**
 * `POST /videos/any` — the ORIGINAL contract: `data` is a bare array.
 *
 * Three pages (watch, channel, account) do `res.data.data.map(...)`. Changing
 * the shape to a paginated envelope broke all three with
 * "videos.map is not a function", which — with no error boundary — blanked
 * the whole page. Keeping the old shape here is the right call: a rename is
 * safe, a reshape is a breaking change.
 *
 * Use `getVideosByOwner` (above) when you want pagination metadata.
 */
export const any = asyncHandler(async (req, res) => {
    const owner = req.body?.owner || req.query?.owner;
    const excludeId = req.body?.excludeId;
    const limit = Math.min(50, Math.max(1, Number(req.body?.limit) || 20));

    if (!mongoose.isValidObjectId(owner)) {
        throw new apiError(400, "`owner` must be a valid user id");
    }

    const filter = { owner };

    // Honour `excludeId` so a video never recommends itself. The original
    // accepted the parameter and ignored it.
    if (excludeId && mongoose.isValidObjectId(excludeId)) {
        filter._id = { $ne: excludeId };
    }

    const videos = await Video.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("owner", "username fullName avatar")
        .lean();

    return res.status(200).json({
        success: true,
        data: videos.map((video) => ({
            ...video,
            durationFormatted: formatDuration(video.duration),
        })),
    });
});

/**
 * Paginated + searchable feed (`/practicevideo`).
 *
 * This was a plain async function whose catch block did `throw new apiError`.
 * Express 4 cannot see a rejected promise from a non-wrapped handler, so the
 * request HUNG and the process logged an unhandled rejection. Wrapping it in
 * asyncHandler is the whole fix.
 */
export const PracticeVideo = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Number(req.query.limit) || 6;

    if (limit < 1 || limit > 24) {
        throw new apiError(400, "`limit` must be between 1 and 24");
    }

    const sort = SORT_MAP[req.query.sort] ? req.query.sort : "latest";
    const filter = await buildFilter(req.query.search || "");

    const [videos, total] = await Promise.all([
        Video.find(filter)
            .sort(SORT_MAP[sort])
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("owner", "username fullName avatar")
            .lean(),
        Video.countDocuments(filter),
    ]);

    return res.status(200).json(
        new apiResponse(
            200,
            {
                videos: videos.map((video) => ({
                    ...video,
                    durationFormatted: formatDuration(video.duration),
                })),
                ...paginationMeta({ page, limit, total }),
            },
            "The video feed has been fetched"
        )
    );
});

/**
 * Trending / search (`/practicetrending`). The navbar typeahead hits this.
 * The comment in the original said "pagination, sort by views" but the code
 * did `Video.find(filter)` with no limit at all -- every keystroke pulled the
 * entire collection.
 */
export const Trending = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 10));
    const hasSearch = Boolean((req.query.search || "").trim());

    const filter = await buildFilter(req.query.search || "");

    // No query -> genuine "trending" (most viewed). With a query, relevance
    // is approximated by recency.
    const sortOption = hasSearch ? SORT_MAP.latest : SORT_MAP.mostViewed;

    const [videos, total] = await Promise.all([
        Video.find(filter)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("owner", "username fullName avatar")
            .lean(),
        Video.countDocuments(filter),
    ]);

    return res.status(200).json(
        new apiResponse(
            200,
            {
                videos: videos.map((video) => ({
                    ...video,
                    durationFormatted: formatDuration(video.duration),
                })),
                ...paginationMeta({ page, limit, total }),
            },
            "The search results have been fetched"
        )
    );
});

/* ------------------------------------------------------------------------- */
/* update / delete                                                           */
/* ------------------------------------------------------------------------- */

// Only these may be changed through the API. The old code did
// `Object.assign(video, req.body)` -- a mass-assignment hole that let a
// client set `views`, `owner`, or `_id` on their own video.
const UPDATABLE_FIELDS = ["title", "description", "isPublished"];

export const updateVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        throw new apiError(400, "That is not a valid video id");
    }

    const video = await Video.findById(id);

    if (!video) throw new apiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You can only edit your own videos");
    }

    let changed = false;

    for (const field of UPDATABLE_FIELDS) {
        if (Object.hasOwn(req.body, field) && req.body[field] !== undefined) {
            video[field] = req.body[field];
            changed = true;
        }
    }

    if (!changed) {
        throw new apiError(400, `Nothing to update. Allowed: ${UPDATABLE_FIELDS.join(", ")}`);
    }

    if (!video.title?.trim()) throw new apiError(400, "`title` cannot be empty");
    if (!video.description?.trim()) throw new apiError(400, "`description` cannot be empty");

    await video.save();

    void indexVideo(video);
    await Promise.all([
        redis.del(`video:${video._id}`).catch(() => {}),
        invalidate(`${FEED_CACHE_PREFIX}:*`),
    ]);

    return res.status(200).json(new apiResponse(200, video, "Video updated"));
});

export const deleteVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        throw new apiError(400, "That is not a valid video id");
    }

    const video = await Video.findById(id);

    if (!video) throw new apiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You can only delete your own videos");
    }

    const { videoFile, thumbnail, _id } = video;

    await video.deleteOne();

    // Free the Cloudinary assets too, otherwise the account fills up with
    // files no row points at any more.
    void destroyByUrl(videoFile, "video");
    void destroyByUrl(thumbnail, "image");
    void removeVideoFromIndex(_id);

    await Promise.all([
        redis.del(`video:${_id}`).catch(() => {}),
        invalidate(`${FEED_CACHE_PREFIX}:*`),
    ]);

    return res.status(200).json(new apiResponse(200, { _id }, "Video deleted successfully"));
});

/* ------------------------------------------------------------------------- */
/* optional Elasticsearch search                                             */
/* ------------------------------------------------------------------------- */

/**
 * Fuzzy search via Elasticsearch, falling back to the Mongo path when the
 * cluster is absent. The original referenced `elastic` without importing it,
 * so this endpoint was a guaranteed ReferenceError.
 */
export const searchElastic = asyncHandler(async (req, res, next) => {
    const q = (req.query.q ?? req.query.search ?? "").trim();

    if (!q) {
        throw new apiError(400, "A search query is required");
    }

    if (!elastic) {
        req.query.search = q;
        return Trending(req, res, next);
    }

    try {
        const result = await elastic.search({
            index: "videos",
            query: {
                multi_match: {
                    query: q,
                    fields: ["title^2", "description"],
                    fuzziness: "AUTO",
                },
            },
        });

        const videos = result.hits.hits.map((hit) => ({ _id: hit._id, ...hit._source }));

        return res.status(200).json(new apiResponse(200, { videos }, "Search results"));
    } catch (err) {
        console.warn(`[elastic] search failed, falling back to Mongo: ${err.message}`);
        req.query.search = q;
        return Trending(req, res, next);
    }
});
