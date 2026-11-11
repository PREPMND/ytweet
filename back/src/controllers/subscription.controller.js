import mongoose from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Subscription } from "../models/subscription.models.js";
import { User } from "../models/user.models.js";

export const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new apiError(400, "`channelId` must be a valid user id");
    }

    if (String(channelId) === String(req.user._id)) {
        throw new apiError(400, "You cannot subscribe to your own channel");
    }

    if (!(await User.exists({ _id: channelId }))) {
        throw new apiError(404, "Channel not found");
    }

    const filter = { subscriber: req.user._id, channel: channelId };

    const existing = await Subscription.findOneAndDelete(filter);

    let subscribed;

    if (existing) {
        subscribed = false;
    } else {
        try {
            await Subscription.create(filter);
            subscribed = true;
        } catch (err) {
            // 11000 = duplicate key. Two concurrent clicks race here; the
            // unique index wins and we just report the already-true state
            // instead of surfacing a 500.
            if (err?.code !== 11000) throw err;
            subscribed = true;
        }
    }

    const subscriberCount = await Subscription.countDocuments({ channel: channelId });

    return res
        .status(200)
        .json(new apiResponse(200, { subscribed, subscriberCount }, "Subscription updated"));
});
