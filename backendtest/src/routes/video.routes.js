import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createVideo, getVideos, getVideoById, updateVideo, deleteVideo } from "../controllers/video.controller.js";

const router = express.Router();

router.post("/", verifyJWT, createVideo);
router.get("/", getVideos);
router.get("/:id", getVideoById);
router.put("/:id", verifyJWT, updateVideo);
router.delete("/:id", verifyJWT, deleteVideo);

export default router;