import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginUser, logOutUser, refreshAccessToken, registerUser ,changeCurrentPassword, getCurrentUser ,updateAccountDetails,updateUserAvatar,updateUserCoverImage, getUserChannelProfile,getWatchHistory} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
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

router.route("/login").post(
    loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logOutUser)
router.route("/refreshtoken").post(refreshAccessToken)
router.route("/changedpsw").post(verifyJWT,changeCurrentPassword)
//router.route("/currentuser").get(verifyJWT,getCurrentUser)
console.log("Token candidate:")
router.get("/currentuser", verifyJWT, (req, res) => {
    console.log("AFTER VERIFY");
    res.json({ user: req.user || null });
});
console.log("Token candidate:");
router.route("/updateaccount").patch(verifyJWT,updateAccountDetails)
router.route("/changeavatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/changecoverimage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)
export default router;