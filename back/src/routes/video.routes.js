import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createVideo, getVideos, getVideoById, updateVideo, deleteVideo, any} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { rateLimiter } from "../middlewares/ratelimiter.middleware.js";
const routerVideo = express.Router();

routerVideo.post("/createvideo", verifyJWT,rateLimiter,
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
routerVideo.post("/any", any);
routerVideo.get("/getvideos", getVideos);
routerVideo.get("/getvideo/:id",  getVideoById);
// use :id as a path param
routerVideo.put("/updatevideo/:id", verifyJWT, rateLimiter, updateVideo);
routerVideo.delete("/deletevideo/:id", verifyJWT,rateLimiter, deleteVideo);
export default routerVideo;