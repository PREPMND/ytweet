import mongoose from "mongoose";
import { Message } from "../models/socket.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import redis from "../redis/redis.js"
export const getConversationId = (user1, user2) => {
    return [user1.toString(), user2.toString()].sort().join("_");
};
const emitToConversation = (req, conversationId, event, payload) => {
    const io = req.app.get("io");
    io.to(conversationId).emit(event, payload);
};
export const sendMessage = asyncHandler(async (req, res) => {
    const sender = req.user?._id;
    const { receiver, text, messageType = "text" } = req.body;

    const conversationId = getConversationId(sender, receiver);

    if (!receiver) {
        throw new apiError(400, "Receiver is required");
    }

    if (!text?.trim() && messageType === "text") {
        throw new apiError(400, "Message cannot be empty");
    }

    const message = await Message.create({
        sender,
        receiver,
        conversationId,
        text,
        messageType,
    });

    return res.status(201).json(
        new apiResponse(201, message, "Message sent successfully")
    );
});

export const getConversations = asyncHandler(async (req, res) => {
    console.log("===== GET CONVERSATIONS =====");
    const userId = new mongoose.Types.ObjectId(req.user._id);

    try {
        //const cacheKey = `conversations:${req.user._id.toString()}`;
        //const cached = await redis.get(cacheKey);
        // const cacheKey = `conversations:${req.user._id.toString()}`;
        // console.log("GET KEY:", cacheKey);

        // const cached = await redis.get(cacheKey);
        // console.log("GET RESULT:", cached ? "HIT" : "MISS");
        //  if (cached) {
        //      return res.status(200).json(
        //          new apiResponse(
        //              200,
        //              JSON.parse(cached),
        //              "Conversations fetched from cache"
        //          )
        //      );
        //  }
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userId },
                        { receiver: userId }
                    ]
                }
            },

            {
                $sort: {
                    createdAt: -1
                }
            },

            {
                $group: {
                    _id: "$conversationId",
                    lastMessage: { $first: "$$ROOT" }
                }
            },

            {
                $addFields: {
                    otherUser: {
                        $cond: [
                            { $eq: ["$lastMessage.sender", userId] },
                            "$lastMessage.receiver",
                            "$lastMessage.sender"
                        ]
                    }
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "otherUser",
                    foreignField: "_id",
                    as: "otherUser"
                }
            },

            {
                $unwind: "$otherUser"
            },

            {
                $project: {
                    _id: 0,
                    conversationId: "$lastMessage.conversationId",
                    lastMessage: "$lastMessage.text",
                    createdAt: "$lastMessage.createdAt",
                    lastSeen: "$lastMessage.lastSeen",
                    status: "$lastMessage.status",
                    otherUser: {
                        _id: "$otherUser._id",
                        username: "$otherUser.username",
                        avatar: "$otherUser.avatar",
                        fullName: "$otherUser.fullName"
                    }
                }
            },
            {
                $sort: { createdAt: -1 }
            }

        ]);
        //console.log("SET KEY:", cacheKey);
        //console.log("Cached:", !!cached);
        // console.log("SET KEY:", cacheKey);

        // await redis.set(cacheKey, JSON.stringify(conversations), {
        //     EX: 300,
        // });
        // await redis.set(
        //     cacheKey,
        //     JSON.stringify(conversations),
        //     {
        //         EX: 300 // 5 minutes
        //     }
        // );

        return res.status(200).json(
            new apiResponse(200, conversations, "Conversations fetched")
        );
    } catch (err) {
        console.error(err);
        throw err;
    }


});
export const getMessages = asyncHandler(async (req, res) => {

    const { receiverId } = req.params;

    const sender = req.user._id;

    const conversationId = getConversationId(sender, receiverId);

    console.log(conversationId);

    const messages = await Message.find({
        conversationId
    }).sort({ createdAt: 1 });


    return res.status(200).json(
        new apiResponse(200, messages, "Messages fetched")
    );

});
export const markMessagesAsSeen = asyncHandler(async (req, res) => {
    try {
        const { conversationId } = req.params;
        const sender = req.user._id;

        await Message.updateMany(
            {
                conversationId,
                receiver: sender,
                status: "sent",
            },
            {
                $set: {
                    status: "seen",
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: "Messages marked as seen",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});