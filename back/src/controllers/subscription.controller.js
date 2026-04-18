import { asyncHandler,api } from "../utils/asyncHandler";
import { Subscription } from "../models/subscription.models";
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