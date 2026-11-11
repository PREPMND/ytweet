import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/ratelimiter.middleware.js";
import {
    sendMessage,
    getMessages,
    getConversations,
    getConversationId,
    markMessagesAsSeen,
} from "../controllers/socket.controller.js";

const routerSocket = Router();

routerSocket.use(verifyJWT);

/*
 * ROUTE ORDER MATTERS. Express matches top-to-bottom, so every STATIC path
 * must be registered before the "/:receiverId" wildcard -- otherwise
 * GET /convo is swallowed by the param route and `receiverId` becomes the
 * literal string "convo". The original file registered
 * "/generateConvoId" AFTER "/:receiverId", so it was unreachable.
 */
routerSocket.post("/send", rateLimit, sendMessage);
routerSocket.patch("/seen/:conversationId", markMessagesAsSeen);
routerSocket.get("/convo", getConversations);
routerSocket.get("/conversation-id", getConversationId);

// Wildcard last.
routerSocket.get("/:receiverId", getMessages);

export default routerSocket;
