import express from "express";
import { ChatController } from "../controllers/chatController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Create new chat session
router.post("/session", authenticateToken, ChatController.createSession);

// Send message in chat
router.post("/message", authenticateToken, ChatController.sendMessage);

router.get("/session", authenticateToken, ChatController.getChatHistory);

router.get("/sessions", authenticateToken, ChatController.getUserSessions);

export default router;