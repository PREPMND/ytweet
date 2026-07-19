import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginUser, logOutUser, refreshAccessToken, registerUser ,changeCurrentPassword, getCurrentUser ,updateAccountDetails,updateUserAvatar,updateUserCoverImage, getUserChannelProfile,getWatchHistory, userById} from "../controllers/user.controller.js"
import {toggleSubscription} from "../controllers/subscription.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { rateLimiter } from "../middlewares/ratelimiter.middleware.js";
import { cache } from "../middlewares/cache.middleware.js";
const router = Router();
//checkingroute
router.route("/register").post(rateLimiter,
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

router.post("/debug", (req,res) => res.send("debug route works"))

router.route("/login").post(
    loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logOutUser)
router.route("/refreshtoken").post(refreshAccessToken)
router.route("/changedpsw").post(verifyJWT,changeCurrentPassword)
//router.route("/currentuser").get(verifyJWT,getCurrentUser)
router.get("/currentuser", verifyJWT, (req, res) => {
    res.json({ user: req.user || null });
});
router.route("/userbyid").post(cache(300), userById)
router.route("/updateaccount").patch(verifyJWT,updateAccountDetails)
router.route("/changeavatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/getchannel").post(verifyJWT,getUserChannelProfile)
router.route("/changecoverimage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)

router.route("/subscriptions/:channelId").post(verifyJWT, rateLimiter, toggleSubscription);

export default router;