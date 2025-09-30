import express from "express";
import { ChatController } from "../controllers/chatController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Create new chat session
router.post("/session", authenticateToken, ChatController.createSession);

// Send message in chat
router.post("/message", authenticateToken, ChatController.sendMessage);

// Get chat history for specific session
router.get("/session/:sessionId", authenticateToken, ChatController.getChatHistory);

// Get user's chat sessions
router.get("/sessions", authenticateToken, ChatController.getUserSessions);

export default router;