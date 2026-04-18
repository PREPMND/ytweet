import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js";
import { Subscription } from "../models/subscription.models.js";
export const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const existing = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    });

    if (existing) {
        await existing.deleteOne();

        return res.json({
            success: true,
            subscribed: false,
        });
    }

    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
    });

    return res.json({
        success: true,
        subscribed: true
    });
});