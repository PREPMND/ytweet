import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  sendMessage,
  getMessages,
  getConversations,
  getConversationId,
  markMessagesAsSeen
} from "../controllers/socket.controller.js";
import { rateLimiter } from "../middlewares/ratelimiter.middleware.js";
import { cache } from "../middlewares/cache.middleware.js";
const routerSocket = Router();

routerSocket.use(verifyJWT);

// Send a message
routerSocket.post("/send",rateLimiter, sendMessage);
routerSocket.patch(
    "/seen/:conversationId",
    verifyJWT,
    markMessagesAsSeen
);
routerSocket.get("/convo", cache(300), getConversations);
// Get all messages of a conversation
routerSocket.get("/:receiverId", getMessages);
// Get all conversations of current user

routerSocket.get("/generateConvoId",getConversationId);
export default routerSocket;