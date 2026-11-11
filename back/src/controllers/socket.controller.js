import mongoose from "mongoose";

import { Message } from "../models/socket.models.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

/**
 * A conversation id is derived, not stored on its own document: sort the two
 * user ids and join them. Deriving it means "A -> B" and "B -> A" always
 * produce the same key without a lookup, and there is no row to keep in sync.
 */
export const buildConversationId = (user1, user2) =>
    [String(user1), String(user2)].sort().join("_");

/** Exposed as GET /api/v1/socket/conversation-id?receiverId=... */
export const getConversationId = asyncHandler(async (req, res) => {
    const receiverId = req.query.receiverId ?? req.body?.receiverId;

    if (!mongoose.isValidObjectId(receiverId)) {
        throw new apiError(400, "`receiverId` must be a valid user id");
    }

    return res.status(200).json(
        new apiResponse(
            200,
            { conversationId: buildConversationId(req.user._id, receiverId) },
            "Conversation id"
        )
    );
});

export const sendMessage = asyncHandler(async (req, res) => {
    const sender = req.user._id;
    const { receiver, text, messageType = "text" } = req.body;

    // Validate FIRST. The original built the conversation id before checking
    // `receiver`, so a missing receiver threw "Cannot read properties of
    // undefined (reading 'toString')" -- a 500 where a 400 belonged.
    if (!receiver) {
        throw new apiError(400, "`receiver` is required");
    }

    if (!mongoose.isValidObjectId(receiver)) {
        throw new apiError(400, "`receiver` must be a valid user id");
    }

    if (String(receiver) === String(sender)) {
        throw new apiError(400, "You cannot message yourself");
    }

    if (messageType === "text" && !text?.trim()) {
        throw new apiError(400, "Message cannot be empty");
    }

    if (text && text.length > 4000) {
        throw new apiError(400, "Message is too long (4000 characters max)");
    }

    const receiverExists = await User.exists({ _id: receiver });

    if (!receiverExists) {
        throw new apiError(404, "Recipient not found");
    }

    const message = await Message.create({
        sender,
        receiver,
        conversationId: buildConversationId(sender, receiver),
        text: text?.trim(),
        messageType,
    });

    return res
        .status(201)
        .json(new apiResponse(201, message, "Message sent successfully"));
});

/** Inbox: one row per conversation, carrying the last message + unread count. */
export const getConversations = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const conversations = await Message.aggregate([
        { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: "$conversationId",
                lastMessage: { $first: "$$ROOT" },
                // Count messages addressed to me that I haven't opened yet.
                unreadCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$receiver", userId] },
                                    { $ne: ["$status", "seen"] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
        {
            $addFields: {
                otherUser: {
                    $cond: [
                        { $eq: ["$lastMessage.sender", userId] },
                        "$lastMessage.receiver",
                        "$lastMessage.sender",
                    ],
                },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "otherUser",
                foreignField: "_id",
                as: "otherUser",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            isOnline: 1,
                            lastSeen: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: "$otherUser" },
        {
            $project: {
                _id: 0,
                conversationId: "$_id",
                lastMessage: "$lastMessage.text",
                lastMessageSender: "$lastMessage.sender",
                messageType: "$lastMessage.messageType",
                createdAt: "$lastMessage.createdAt",
                status: "$lastMessage.status",
                unreadCount: 1,
                otherUser: 1,
            },
        },
        { $sort: { createdAt: -1 } },
    ]);

    return res
        .status(200)
        .json(new apiResponse(200, conversations, "Conversations fetched"));
});

/** Message history for one thread, newest page first, oldest-first within it. */
export const getMessages = asyncHandler(async (req, res) => {
    const { receiverId } = req.params;

    if (!mongoose.isValidObjectId(receiverId)) {
        throw new apiError(400, "`receiverId` must be a valid user id");
    }

    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const before = req.query.before ? new Date(req.query.before) : null;

    const conversationId = buildConversationId(req.user._id, receiverId);

    const query = { conversationId };
    if (before && !Number.isNaN(before.getTime())) {
        query.createdAt = { $lt: before };
    }

    // Fetch the newest `limit`, then reverse so the UI can append top-to-bottom.
    const page = await Message.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    const messages = page.reverse();

    return res.status(200).json(
        new apiResponse(
            200,
            messages,
            "Messages fetched"
        )
    );
});

export const markMessagesAsSeen = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    if (!conversationId) {
        throw new apiError(400, "`conversationId` is required");
    }

    // Only messages addressed to the caller may be marked seen -- otherwise
    // anyone could mark someone else's inbox as read by guessing an id.
    const result = await Message.updateMany(
        { conversationId, receiver: req.user._id, status: { $ne: "seen" } },
        { $set: { status: "seen" } }
    );

    return res.status(200).json(
        new apiResponse(200, { updated: result.modifiedCount }, "Messages marked as seen")
    );
});
