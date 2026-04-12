import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createVideo, getVideos, getVideoById, updateVideo, deleteVideo } from "../controllers/video.controller.js";

const routerVideo = express.Router();

routerVideo.post("/", verifyJWT, createVideo);
routerVideo.get("/", getVideos);
routerVideo.get("/:id", getVideoById);
routerVideo.put("/:id", verifyJWT, updateVideo);
routerVideo.delete("/:id", verifyJWT, deleteVideo);

export default routerVideo;