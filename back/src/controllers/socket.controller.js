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

export const getMessages = asyncHandler(async (req, res) => {

    console.log(req.params);

    const { receiverId } = req.params;

    const sender = req.user._id;

    const conversationId = getConversationId(sender, receiverId);

    console.log(conversationId);

    const messages = await Message.find({
        conversationId
    }).sort({ createdAt: 1 });

    console.log(messages);

    return res.status(200).json(
        new apiResponse(200, messages, "Messages fetched")
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
        new apiResponse(200, conversations)
    );
});