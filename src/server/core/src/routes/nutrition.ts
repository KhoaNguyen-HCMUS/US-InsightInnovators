
import express from "express";

import { ProfileController } from "../controllers/profileController";
import { FoodController } from "../controllers/foodController";
import { MealController } from "../controllers/mealController";
import { ChatController } from "../controllers/chatController";
import { PromptController } from "../controllers/promptController";

const router = express.Router();

// Middleware demo: gắn userId từ header (x-user-id) vào req
router.use((req, _res, next) => {
  const raw = (req.headers["x-user-id"] as string) || "1";
  (req as any).userId = BigInt(raw);
  next();
});

/* --------------------------------- PROFILE --------------------------------- */
router.get("/profile", ProfileController.getProfile);
router.put("/profile", ProfileController.updateProfile);

/* ---------------------------------- FOODS ---------------------------------- */
router.get("/foods", FoodController.searchFoods);
router.get("/foods/:id", FoodController.getFoodById);

/* ---------------------------------- MEALS ---------------------------------- */
router.post("/meals", MealController.createMeal);
// Đổi path nếu bạn muốn “/progress/today” hay “/meals/summary”
router.get("/meals/today", MealController.getTodayProgress);

/* ------------------------------ CHAT (memory) ------------------------------ */
router.post("/chat/sessions", ChatController.createSession);
router.get("/chat/sessions", ChatController.getSessions);
router.post("/chat/messages", ChatController.createMessage);
router.get("/chat/sessions/:id/messages", ChatController.getSessionMessages);

/* ----------------------------- PROMPTS (optional) -------------------------- */
router.post("/prompts", PromptController.createPrompt);

/* --------------------------------- HEALTHZ --------------------------------- */
router.get("/healthz", PromptController.healthCheck);

export default router;
