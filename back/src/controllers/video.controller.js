import mongoose from "mongoose";
import redis from "../redis/redis.js";
import { Video } from "../models/video.models.js"; // adjust path if needed
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // adjust path if needed
import { apiError } from "../utils/apiError.js"; // adjust path if needed
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
export const any = asyncHandler(async (req, res) => {
    const { owner } = req.body;
    const pipelines = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(owner),
            },
        },
    ]);
    return res.status(200).json({ success: true, data: pipelines });
});
export const createVideo = async (req, res) => {
    try {

        const { title, description } = req.body;

        const videoLocalPath = req.files?.videoFile?.[0]?.path;
        const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

        if (!videoLocalPath) {
            throw new apiError(400, "Video File Is Required");
        }

        const videoUpload = await uploadOnCloudinary(videoLocalPath);
        const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

        if (!videoUpload) {
            throw new apiError(400, "Video cannot be uploaded");
        }
        const loggedInUser = await User.findById(req.user._id).select(
            "-password -refreshToken -email -createdAt -updatedAt"
        )
        const videoDoc = await Video.create({
            title,
            description,
            owner: loggedInUser,
            isPublished: true,
            videoFile: videoUpload.secure_url,
            duration: Math.floor(videoUpload.duration),
            thumbnail: thumbnailUpload?.secure_url,
        });
        const keys = await redis.keys("videos:*");
        if (keys.length > 0) {
            await redis.del(keys);
        }
        res.status(201).json({ success: true, data: videoDoc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getVideos = async (req, res) => {
    console.log("ewgrhetjehwrhejsr")
    try {
        const { page = 1, limit = 6 } = req.query;
        const sort = req.query.sort || "latest";
        const cacheKey = `videos:${page}:${limit}:${sort}`;
        const cachedVideos = await redis.get(cacheKey);

        if (cachedVideos) {
            console.log("Cache Hit");

            return res.status(200).json(JSON.parse(cachedVideos));
        }
        let sortOption = {};
        switch (sort) {
            case "latest":
                sortOption = { createdAt: -1 };
                break;
            case "oldest":
                sortOption = { createdAt: 1 };
                break;
        }
        const aggregate = Video.aggregate([
            { $match: { isPublished: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            { $unwind: "$owner" },
            {
                $project: {
                    title: 1,
                    description: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    duration: 1,
                    createdAt: 1,
                    "owner._id": 1,
                    "owner.username": 1,
                    "owner.email": 1,
                    "owner.avatar": 1,
                    "owner.coverImage": 1
                },
            },
            { $sort: sortOption }
        ]);

        // Use aggregatePaginate for proper pagination
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: sortOption
        };

        const videos = await Video.aggregatePaginate(aggregate, options);
        
        function formatDuration(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            if (seconds < 60) return `${seconds}s`;
            if (seconds < 3600) return `${minutes}m`;
            return `${hours}h ${minutes}m`;
        }

        videos.docs = videos.docs.map((v) => ({
            ...v,
            durationFormatted: formatDuration(v.duration || 0),
        }));
        await redis.set(
            cacheKey,
            JSON.stringify({
                success: true,
                data: videos
            }),
            {
                EX: 300
            }
        );
        res.status(200).json({ success: true, data: videos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Get single video by ID
export const getVideoById = async (req, res) => {
    try {
        const cacheKey = `video:${req.params.id}`;

        const cachedVideo = await redis.get(cacheKey);

        if (cachedVideo) {
            console.log("Video Cache Hit");

            return res.status(200).json(JSON.parse(cachedVideo));
        }
        const video = await Video.findById(req.params.id).populate("owner", "username avatar email");
        function formatDuration(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            if (seconds < 60) return `${seconds}s`;
            if (seconds < 3600) return `${minutes}m`;
            return `${hours}h ${minutes}m`;
        }

        video.durationFormatted = formatDuration(video.duration || 0);
        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }
        await redis.set(
            cacheKey,
            JSON.stringify({
                success: true,
                data: video
            }),
            {
                EX: 300
            }
        );
        res.status(200).json({ success: true, data: video });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Update video
export const updateVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        // Only owner can update
        if (video.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        Object.assign(video, req.body);
        await video.save();
        await redis.del(`video:${video._id}`);
        const keys = await redis.keys("videos:*");
        if (keys.length > 0) {
            await redis.del(keys);
        }
        res.status(200).json({ success: true, data: video });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete video
export const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        if (video.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await video.deleteOne();
        await redis.del(`video:${video._id}`);
        const keys = await redis.keys("videos:*");

        if (keys.length > 0) {
            await redis.del(keys);
        }
        res.status(200).json({ success: true, message: "Video deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
{/*Task 1 (Main)

Implement the controller.

Requirements:

page default = 1
limit default = 6
search optional
sort: latest oldest mostViewed published filter pagination return videos currentPage totalPages totalVideos hasNextPage hasPrevPage
*/}
export const PracticeVideo = async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        const sort = (req.query.sort) || "latest";
        if (page < 1 || limit < 1 || limit > 12) {
            throw new apiError(401, "Invalid Query Parameters");
        }
        let search = req.query.search || "";
        let owner = "";
        const words = search.trim().split(/\s+/);
        const ownerToken = words.find(word => word.startsWith("o/"));
        if (ownerToken) {
            if (ownerToken && ownerToken.length > 2) {
                owner = ownerToken.slice(2);
            }
            search = words
                .filter(word => word !== ownerToken)
                .join(" ");
        }
        let ownerIds = [];
        if (owner.trim()) {
            const users = await User.find({
                username: {
                    $regex: owner,
                    $options: "i"
                }
            });
            ownerIds = users.map(user => user._id);
        }
        const filter = {
            isPublished: true,
        };
        if (search.trim()) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                },
            ];
        }
        if (owner.trim()) {
            filter.owner = {
                $in: ownerIds,
            }
        }
        let sortOption = {};
        switch (sort) {
            case "latest":
                sortOption = { createdAt: -1 };
                break;
            case "oldest":
                sortOption = { createdAt: 1 };
                break;

        }
        const [videos, totalVideos] = await Promise.all([
            Video.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(limit),
            Video.countDocuments(filter)
        ]);
        const totalPages = Math.ceil(totalVideos / limit);
        return res.status(200).json(
            new apiResponse(200, { videos, totalVideos, totalPages }, "The Video Feed Has Been Fetched")
        );
    } catch (error) {
        throw new apiError(400, "Could'nt fetch ")
    }
}
/*
Q4. Build this Controller

Implement:
GET /api/v1/videos/trending
Requirements:
PaginationOnly published videosSort by views (highest first)Return:videos currentPage totalVideos totalPages */
export const Trending = async (req, res) => {
    try {

        let search = req.query.search || "";
        let owner = "";
        const words = search.trim().split(/\s+/);
        const ownerToken = words.find(word => word.startsWith("o/"));
        if (ownerToken) {
            if (ownerToken && ownerToken.length > 2) {
                owner = ownerToken.slice(2);
            }
            search = words
                .filter(word => word !== ownerToken)
                .join(" ");
        }
        let ownerIds = [];
        if (owner.trim()) {
            const users = await User.find({
                username: {
                    $regex: owner,
                    $options: "i"
                }
            });
            ownerIds = users.map(user => user._id);
        }
        const filter = {
            isPublished: true,
        };
        if (search.trim()) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                },
            ];
        }
        if (owner.trim()) {
            filter.owner = {
                $in: ownerIds,
            }
        }

        const [videos, totalVideos] = await Promise.all([
            Video.find(filter),
            Video.countDocuments(filter)
        ])
        return res.status(200).json(
            new apiResponse(200, { videos, totalVideos }, "The Search Results Has Been Fetched")
        );
    } catch (error) {
        throw new apiError(401, "Cannot really fetch the desired output")
    }
}
