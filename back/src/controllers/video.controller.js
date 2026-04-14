import { Video } from "../models/video.models.js"; // adjust path if needed
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // adjust path if needed
import { apiError } from "../utils/apiError.js"; // adjust path if needed
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

    const videoDoc = await Video.create({
      title,
      description,
      owner: req.user._id,
      isPublished: true,
      videoFile: videoUpload.secure_url,
      thumbnail: thumbnailUpload?.secure_url,
    });

    res.status(201).json({ success: true, data: videoDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all videos (with pagination)
export const getVideos = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const aggregate = Video.aggregate([{ $match: { isPublished: true } }]);
        const options = { page, limit };

        const videos = await Video.aggregatePaginate(aggregate, options);

        res.status(200).json({ success: true, data: videos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single video by ID
export const getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id).populate("owner", "username email");

        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

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

        res.status(200).json({ success: true, message: "Video deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};