import express from "express";
import multer from "multer";
import { FoodController } from "../controllers/foodController";
import { authenticateToken, optionalAuth } from "../middleware/auth";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/food/predict", optionalAuth, upload.single("file"), FoodController.classifyFood);
router.post("/food/detail", optionalAuth, FoodController.getFoodDetail);
router.post("/food/log", authenticateToken, FoodController.logSelectedFood);
router.get("/food/history", authenticateToken, FoodController.getUserFoodHistory);

export default router;
