import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginUser, logOutUser, refreshAccessToken, registerUser ,changeCurrentPassword, getCurrentUser ,updateAccountDetails,updateUserAvatar,updateUserCoverImage, getUserChannelProfile,getWatchHistory, userById} from "../controllers/user.controller.js"
import {toggleSubscription} from "../controllers/subscription.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { rateLimiter } from "../middlewares/ratelimiter.middleware.js";
const router = Router();
//checkingroute
router.route("/register").post(
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

router.route("/login").post(rateLimiter,
    loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logOutUser)
router.route("/refreshtoken").post(refreshAccessToken)
router.route("/changedpsw").post(verifyJWT,rateLimiter,changeCurrentPassword)
//router.route("/currentuser").get(verifyJWT,getCurrentUser)
router.get("/currentuser", verifyJWT, (req, res) => {
    res.json({ user: req.user || null });
});
router.route("/userbyid").post(rateLimiter, userById)
router.route("/updateaccount").patch(verifyJWT,rateLimiter,updateAccountDetails)
router.route("/changeavatar").patch(verifyJWT,rateLimiter,upload.single("avatar"),updateUserAvatar)
router.route("/getchannel").post(verifyJWT,rateLimiter,getUserChannelProfile)
router.route("/changecoverimage").patch(verifyJWT,rateLimiter,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,rateLimiter,getUserChannelProfile)
router.route("/history").get(verifyJWT,rateLimiter,getWatchHistory)

router.route("/subscriptions/:channelId").post(verifyJWT, rateLimiter, toggleSubscription);

export default router;