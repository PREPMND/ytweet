import {Router} from "express"
import { application } from "../app.js";
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
console.log("Token candidate:");
router.get("/ping", verifyJWT, (req, res) => {
  res.json({ message: "verifyJWT ran", user: req.user || null });
});
router.route("/currentuser").get(verifyJWT,getCurrentUser)
console.log("Token candidate:");
router.route("/updateaccount").patch(verifyJWT,updateAccountDetails)
router.route("/changeavatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/changecoverimage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)
application._router.stack.forEach(r => {
  if (r.route) {
    console.log(r.route.path, r.route.methods);
  }
});
export default router;