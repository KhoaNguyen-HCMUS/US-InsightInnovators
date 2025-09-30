import express from "express";
import { DiagnoseController } from "../controllers/diagnoseController";
import { authenticateToken, optionalAuth } from "../middleware/auth";

const router = express.Router();

// Public endpoint - anyone can use (but won't save history without auth)
router.post("/", optionalAuth, DiagnoseController.diagnose);

// Protected endpoint - requires authentication
router.get("/history", authenticateToken, DiagnoseController.getHistory);

export default router;