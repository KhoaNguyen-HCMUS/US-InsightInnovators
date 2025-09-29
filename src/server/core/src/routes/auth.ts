import express from "express";
import { AuthController } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Protected routes (authentication required)
router.get("/profile", authenticateToken, AuthController.getProfile);
router.post("/refresh", authenticateToken, AuthController.refreshToken);

export default router;