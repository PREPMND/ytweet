import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createVideo, getVideos, getVideoById, updateVideo, deleteVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const routerVideo = express.Router();

routerVideo.post("/createvideo", verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    createVideo);
routerVideo.get("/getvideos", getVideos);
routerVideo.get("/getvideo/:id", getVideoById);
routerVideo.put("/updatevideo/:id", verifyJWT, updateVideo);
routerVideo.delete("/deletevideo/:id", verifyJWT, deleteVideo);

export default routerVideo;