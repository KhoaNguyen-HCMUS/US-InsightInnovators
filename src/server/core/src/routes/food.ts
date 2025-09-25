import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000/predict-food101";
const USDA_API_KEY = process.env.USDA_API_KEY || "tJdjHWVRQRXrvUeerdUgdqAdfOntOEHnEUJGEXV4"
const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

// Define types for ML service and USDA API responses
interface MLServiceResponse {
  top5: Record<string, number>;
}

interface USDANutrient {
  nutrientName: string;
  unitName: string;
  value: number;
}

interface USDAFood {
  description: string;
  fdcId: number;
  foodNutrients?: USDANutrient[];
}

interface USDASearchResponse {
  foods?: USDAFood[];
}

// Transform ML labels to USDA-friendly search terms
function transformFoodLabel(label: string): string {
  return label
    .replace(/_/g, ' ')           // hot_dog -> hot dog
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase -> camel Case
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Title Case
    .join(' ');
}

// Helper function to get nutrition data
async function getNutritionData(foodLabel: string) {
  if (!USDA_API_KEY) {
    console.warn("⚠️ USDA API key not configured, skipping nutrition lookup");
    return [];
  }

  try {
    // Transform the ML label to a USDA-friendly search term
    const searchTerm = transformFoodLabel(foodLabel);
    
    const searchUrl = `${USDA_BASE}/foods/search?query=${encodeURIComponent(searchTerm)}&pageSize=3&api_key=${USDA_API_KEY}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.error(`❌ USDA API error: ${response.status}`);
      return [];
    }

    const data = await response.json() as USDASearchResponse;
    
    return data.foods?.map((food: USDAFood) => ({
      description: food.description,
      fdcId: food.fdcId,
      nutrients: food.foodNutrients?.map((nutrient: USDANutrient) => ({
        name: nutrient.nutrientName,
        unit: nutrient.unitName,
        value: nutrient.value
      })) || []
    })) || [];
    
  } catch (error) {
    console.error("❌ USDA API exception:", error);
    return [];
  }
}

router.post("/food", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 1. Get ML prediction
    const formData = new FormData();
    formData.append("file", req.file.buffer, { filename: req.file.originalname });

    const mlResp = await fetch(ML_SERVICE_URL, { method: "POST", body: formData as any });
    const mlData = await mlResp.json() as MLServiceResponse;

    // Get top prediction
    const topLabel = Object.entries(mlData.top5)
      .sort(([,a], [,b]) => Number(b) - Number(a))[0][0];

    // 2. Get nutrition data from USDA (if available)
    const usdaOptions = await getNutritionData(topLabel);

    // 3. Return results
    return res.json({
      success: true,
      predictions: mlData.top5,
      top_prediction: topLabel,
      nutrition: usdaOptions
    });
    
  } catch (err) {
    console.error("❌ Food API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
