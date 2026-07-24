import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createVideo, getVideos, getVideoById, updateVideo, deleteVideo, any, PracticeVideo, Trending} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { rateLimiter } from "../middlewares/ratelimiter.middleware.js";
import { cache } from "../middlewares/cache.middleware.js";
import { markMessagesAsSeen } from "../controllers/socket.controller.js";
const routerVideo = express.Router();
console.log("wefwr")
routerVideo.get("/practicevideo",PracticeVideo);
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

routerVideo.post("/any",cache(300), any);
routerVideo.get("/getvideos",cache(300), getVideos);
console.log("Practice route registered");
routerVideo.get("/practicetrending",Trending);
routerVideo.get("/getvideo/:id",cache(300),  getVideoById);
// use :id as a path param
routerVideo.put("/updatevideo/:id", verifyJWT, rateLimiter, updateVideo);
routerVideo.delete("/deletevideo/:id", verifyJWT,rateLimiter, deleteVideo);
export default routerVideo;