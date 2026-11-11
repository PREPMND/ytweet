import { Router } from "express";

import { verifyJWT, optionalJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { rateLimit, authRateLimit } from "../middlewares/ratelimiter.middleware.js";
import { cache } from "../middlewares/cache.middleware.js";
import {
    loginUser,
    logOutUser,
    refreshAccessToken,
    registerUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    userById,
    searchUsers,
} from "../controllers/user.controller.js";
import { toggleSubscription } from "../controllers/subscription.controller.js";
import {
    toggleWatchLater,
    getWatchLater,
    toggleNotInterested,
    getLibraryIds,
} from "../controllers/library.controller.js";

const router = Router();

/* ------------------------------- public ---------------------------------- */

router.route("/register").post(
    authRateLimit,
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

router.route("/login").post(authRateLimit, loginUser);
router.route("/refreshtoken").post(rateLimit, refreshAccessToken);
router.route("/userbyid").post(cache(300), userById);

/* ------------------------------- secured --------------------------------- */

router.route("/logout").post(verifyJWT, logOutUser);
router.route("/currentuser").get(verifyJWT, getCurrentUser);
router.route("/changedpsw").post(verifyJWT, rateLimit, changeCurrentPassword);
router.route("/updateaccount").patch(verifyJWT, rateLimit, updateAccountDetails);
router.route("/search").get(verifyJWT, searchUsers);
router.route("/history").get(verifyJWT, getWatchHistory);

/* --------------------------------- library -------------------------------- */

router.route("/library").get(verifyJWT, getLibraryIds);
router.route("/watchlater").get(verifyJWT, getWatchLater);
router.route("/watchlater/:videoId").post(verifyJWT, rateLimit, toggleWatchLater);
router.route("/notinterested/:videoId").post(verifyJWT, rateLimit, toggleNotInterested);

router
    .route("/changeavatar")
    .patch(verifyJWT, rateLimit, upload.single("avatar"), updateUserAvatar);

router
    .route("/changecoverimage")
    .patch(verifyJWT, rateLimit, upload.single("coverImage"), updateUserCoverImage);

/* Channel profile: readable by anonymous visitors too, which is why it uses
   optionalJWT -- `isSubscribed` is simply false when nobody is signed in. */
router.route("/getchannel").post(optionalJWT, getUserChannelProfile);
router.route("/c/:username").get(optionalJWT, getUserChannelProfile);

router.route("/subscriptions/:channelId").post(verifyJWT, rateLimit, toggleSubscription);

export default router;
