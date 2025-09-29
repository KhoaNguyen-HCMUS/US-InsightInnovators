// src/routes/nutrition.ts
import express from "express";
import {
  authenticateToken,
  optionalAuth,
  AuthenticatedRequest,
} from "../middleware/auth";
import { ProfileController } from "../controllers/profileController";
import { FoodController } from "../controllers/foodController";
import { MealController } from "../controllers/mealController";
import { PromptController } from "../controllers/promptController";
import { ChatbotController } from "../controllers/chatbotController";

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
router.post("/chat/sessions", ChatbotController.createSession);
router.get("/chat/sessions", ChatbotController.getSessions);
router.post("/chat/messages", ChatbotController.createMessage);
router.get("/chat/sessions/:id/messages", ChatbotController.getSessionMessages);

// PROMPTS
router.post("/prompts", PromptController.createPrompt);


export default router;
