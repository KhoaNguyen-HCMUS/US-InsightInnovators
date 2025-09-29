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

// PROFILE - Enhanced với AI support
router.get("/profile", ProfileController.getProfile);
router.post("/profile", ProfileController.createProfile);
router.put("/profile", ProfileController.updateProfile);
router.get("/profile/insights", ProfileController.getProfileInsights);
router.get("/profile/constraints", ProfileController.getHealthConstraints);

// FOODS - Smart recommendations
router.get("/foods", FoodController.searchFoods);
router.get("/foods/:id", FoodController.getFoodById);
router.get("/foods/recommend", FoodController.recommendFoods);
router.get("/foods/:id/alternatives", FoodController.getFoodAlternatives);
router.get("/foods/nutrients/gaps", FoodController.analyzeNutrientGaps);

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

// HEALTH CHECK
router.get("/healthz", PromptController.healthCheck);

export default router;
