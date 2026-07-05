import mongoose from "mongoose";
import { Message } from "../models/socket.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
export const getConversationId = (user1, user2) => {
    return [user1.toString(), user2.toString()].sort().join("_");
};
export const sendMessage = asyncHandler(async (req, res) => {
    const sender = req.user?._id;
    const { receiver, text, messageType = "text" } = req.body;

    const conversationId = getConversationId(sender, receiver);
    if (!receiver || !conversationId) {
        throw new apiError(400, "Receiver and conversationId are required");
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
    console.log("fwg");
    console.log(message)
    return res.status(201).json(
        new apiResponse(201, message, "Message sent successfully")
    );
});

export const getConversations = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    try {
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

                    otherUser: {
                        _id: "$otherUser._id",
                        username: "$otherUser.username",
                        avatar: "$otherUser.avatar",
                        fullName: "$otherUser.fullName"
                    }
                }
            }

        ]);


        return res.status(200).json(
            new apiResponse(200, conversations, "Conversations fetched")
        );
    } catch (err) {
        console.error(err);
        throw err;
    }

    return res.status(200).json(
        new apiResponse(
            200,
            conversations,
            "Conversations fetched successfully"
        )
    );

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
