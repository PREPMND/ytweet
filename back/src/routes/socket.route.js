import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  sendMessage,
  getMessages,
  getConversations,
  getConversationId
} from "../controllers/socket.controller.js";

const routerSocket = Router();

routerSocket.use(verifyJWT);

// Send a message
routerSocket.post("/send", sendMessage);
routerSocket.get("/convo", getConversations);
// Get all messages of a conversation
routerSocket.get("/:receiverId", getMessages);
// Get all conversations of current user

routerSocket.get("/generateConvoId",getConversationId);
export default routerSocket;