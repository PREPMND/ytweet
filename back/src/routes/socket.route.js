import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  sendMessage,
  getMessages,
  getConversations,
} from "../controllers/message.controller.js";

const routerSocket = Router();

routerSocket.use(verifyJWT);

// Send a message
routerSocket.post("/send", sendMessage);

// Get all messages of a conversation
routerSocket.get("/:conversationId", getMessages);

// Get all conversations of current user
routerSocket.get("/", getConversations);

export default routerSocket;