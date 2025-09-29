import express from "express";
import multer from "multer";
import { FoodController } from "../controllers/foodController";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/food", upload.single("file"), FoodController.classifyFood);
router.post("/food/log", FoodController.logSelectedFood);

export default router;
