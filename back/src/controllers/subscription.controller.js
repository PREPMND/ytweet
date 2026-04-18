import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js";
import { Subscription } from "../models/subscription.models.js";
const subscribe = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (channelId === req.user._id.toString()) {
    throw new apiError(400, "Cannot subscribe to yourself");
  }

  const sub = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res.status(200).json(
    new apiResponse(200, sub, "Subscribed successfully")
  );
});