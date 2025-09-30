// src/routes/nutrition.ts
import express from "express";
import {
  authenticateToken,
  optionalAuth,
  AuthenticatedRequest,
} from "../middleware/auth";
import { ProfileController } from "../controllers/profileController";
import { MealController } from "../controllers/mealController";
import { PromptController } from "../controllers/promptController";
import { ChatbotController } from "../controllers/chatbotController";
import { MealPlanController } from "../controllers/MealPlanController";

const router = express.Router();

router.use(authenticateToken);

// PROFILE - Enhanced với AI support
router.get("/profile", ProfileController.getProfile);
router.post("/profile", ProfileController.createProfile);
router.put("/profile", ProfileController.updateProfile);
router.get("/profile/insights", ProfileController.getProfileInsights);
router.get("/profile/constraints", ProfileController.getHealthConstraints);

// MEALS - Advanced analytics
router.post("/meals", MealController.createMeal);
router.get("/meals/today", MealController.getTodayProgress);
router.get("/meals/analytics", MealController.getMealAnalytics);
router.get("/meals/suggestions", MealController.getMealSuggestions);
router.get("/meals/patterns", MealController.getEatingPatterns);

// CHAT
router.post("/chat/sessions", ChatbotController.createSession);
router.get("/chat/sessions", ChatbotController.getSessions);
router.post("/chat/messages", ChatbotController.createMessage);
router.get("/chat/sessions/:id/messages", ChatbotController.getSessionMessages);

// PROMPTS - Enhanced AI prompt management
router.post("/prompts", PromptController.createPrompt);
router.get("/prompts", PromptController.getUserPrompts);
router.post("/prompts/optimize", PromptController.optimizePrompt);
router.get("/prompts/templates", PromptController.getPromptTemplates);

// MEAL PLANNING - AI-powered meal planning (Use Case driven)
router.post("/meal-plans", MealPlanController.generateMealPlan);
router.get("/meal-plans", MealPlanController.getMealPlans);
router.get("/meal-plans/:id", MealPlanController.getMealPlan);
router.put("/meal-plans/:id", MealPlanController.updateMealPlan);
router.delete("/meal-plans/:id", MealPlanController.deleteMealPlan);
router.get("/meal-plans/:id/grocery-list", MealPlanController.getGroceryList);
router.post("/meal-plans/:id/substitute", MealPlanController.substituteDish);

// HEALTH CHECK
router.get("/healthz", PromptController.healthCheck);

export default router;
