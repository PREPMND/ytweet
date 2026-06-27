import { Message } from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const sendMessage = asyncHandler(async (req, res) => {
    const sender = req.user?._id;
    const { receiver, conversationId, text, messageType = "text" } = req.body;

    if (!receiver || !conversationId) {
        throw new ApiError(400, "Receiver and conversationId are required");
    }

    if (!text?.trim() && messageType === "text") {
        throw new ApiError(400, "Message cannot be empty");
    }

    const message = await Message.create({
        sender,
        receiver,
        conversationId,
        text,
        messageType,
    });

    return res.status(201).json(
        new ApiResponse(201, message, "Message sent successfully")
    );
});

export const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    const messages = await Message.find({
        conversationId,
    }).sort({ createdAt: 1 });

    return res.status(200).json(
        new ApiResponse(200, messages)
    );
});
export const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const conversations = await Message.find({
        $or: [
            { sender: userId },
            { receiver: userId }
        ]
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, conversations)
    );
});