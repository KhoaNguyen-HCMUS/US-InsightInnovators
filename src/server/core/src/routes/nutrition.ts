// src/routes/nutrition.ts
import express from "express";
import { authenticateToken, optionalAuth, AuthenticatedRequest } from "../middleware/auth";
import { ProfileController } from "../controllers/profileController";
import { FoodController } from "../controllers/foodController";
import { MealController } from "../controllers/mealController";
import { ChatController } from "../controllers/chatController";
import { PromptController } from "../controllers/promptController";

const router = express.Router();

router.use(authenticateToken);

// PROFILE
router.get("/profile", ProfileController.getProfile);
router.put("/profile", ProfileController.updateProfile);

// FOODS 
router.get("/foods", FoodController.searchFoods);
router.get("/foods/:id", FoodController.getFoodById);

// MEALS
router.post("/meals", MealController.createMeal);
router.get("/meals/today", MealController.getTodayProgress);

// CHAT
router.post("/chat/sessions", ChatController.createSession);
router.get("/chat/sessions", ChatController.getSessions);
router.post("/chat/messages", ChatController.createMessage);
router.get("/chat/sessions/:id/messages", ChatController.getSessionMessages);

// PROMPTS
router.post("/prompts", PromptController.createPrompt);

export default router;
