import express from "express";
import multer from "multer";
import { FoodController } from "../controllers/foodController";
import { authenticateToken, optionalAuth } from "../middleware/auth";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/predict", optionalAuth, upload.single("file"), FoodController.classifyFood);
router.post("/detail", optionalAuth, FoodController.getFoodDetail);
router.post("/log", authenticateToken, FoodController.logSelectedFood);
router.get("/history", authenticateToken, FoodController.getUserFoodHistory);

export default router;
