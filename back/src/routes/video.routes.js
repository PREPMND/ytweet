import { Router } from "express";

import { verifyJWT, optionalJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { rateLimit } from "../middlewares/ratelimiter.middleware.js";
import { cache } from "../middlewares/cache.middleware.js";
import {
    createVideo,
    getVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    any,
    PracticeVideo,
    Trending,
    searchElastic,
} from "../controllers/video.controller.js";

const routerVideo = Router();

/* --------------------------------- reads --------------------------------- */
/* Static paths before "/getvideo/:id" so none of them get captured by it. */

routerVideo.get("/getvideos", getVideos);
routerVideo.get("/practicevideo", PracticeVideo);
routerVideo.get("/practicetrending", Trending);
routerVideo.get("/search", searchElastic);
routerVideo.post("/any", cache(300), any);

// optionalJWT so a signed-in viewer's watch history is recorded, while
// anonymous visitors can still watch.
routerVideo.get("/getvideo/:id", optionalJWT, getVideoById);

/* --------------------------------- writes -------------------------------- */

routerVideo.post(
    "/createvideo",
    verifyJWT,
    rateLimit,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    createVideo
);

routerVideo.put("/updatevideo/:id", verifyJWT, rateLimit, updateVideo);
routerVideo.delete("/deletevideo/:id", verifyJWT, rateLimit, deleteVideo);

export default routerVideo;
