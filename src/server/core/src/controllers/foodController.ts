import fetch from "node-fetch";
import FormData from "form-data";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000/predict-food101";
const USDA_API_KEY = process.env.USDA_API_KEY || "tJdjHWVRQRXrvUeerdUgdqAdfOntOEHnEUJGEXV4";
const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

// Define types
interface MLServiceResponse {
  top5: Record<string, number>;
}

interface USDANutrient {
  nutrientName: string;
  unitName: string;
  value: number;
}

interface USDAPortion {
  modifier: string;
  gramWeight: number;
}

interface USDAFood {
  description: string;
  fdcId: number;
  dataType?: string;
  foodCategory?: string;
  foodNutrients?: USDANutrient[];
  foodPortions?: USDAPortion[];
}

interface USDASearchResponse {
  foods?: USDAFood[];
}

// Transform ML labels to USDA-friendly search terms
function transformFoodLabel(label: string): string {
  return label
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper function to get nutrition data with optional keywords
async function getNutritionData(foodLabel: string, keywords: string = "", limit = 5) {
  if (!USDA_API_KEY) {
    console.warn("⚠️ USDA API key not configured, skipping nutrition lookup");
    return [];
  }

  // Helper to fetch by datatype
  async function fetchByDataType(dataTypes: string[]) {
    const baseTerm = transformFoodLabel(foodLabel);

    // Properly concat label + keywords (split keywords by comma if provided)
    let searchTerm = baseTerm;
    if (keywords && keywords.trim()) {
      // Split keywords by comma and join with space
      const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);
      searchTerm = [baseTerm, ...keywordList].join(' ');
    }

    const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(
      searchTerm
    )}&pageSize=${limit}&dataType=${dataTypes.join(",")}&api_key=${USDA_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`❌ USDA API error [${dataTypes.join(",")}]: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as USDASearchResponse;
    return data.foods || [];
  }

  try {
    let foods: USDAFood[] = [];

    const priorityGroups = [
      ["Survey (FNDDS)"], // Best for prepared/restaurant foods
      ["SR Legacy"],      // Good for common foods and combinations  
      ["Branded"],        // Commercial products
      ["Foundation"],     // Basic ingredients - check last
    ];

    // Try each priority group
    for (const group of priorityGroups) {
      foods = await fetchByDataType(group);
      if (foods.length > 0) {
        break;
      }
    }

    // If no results found with keywords, try without keywords
    if (foods.length === 0 && keywords && keywords.trim()) {
      const baseTerm = transformFoodLabel(foodLabel);
      
      for (const group of priorityGroups) {
        const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(
          baseTerm
        )}&pageSize=${limit}&dataType=${group.join(",")}&api_key=${USDA_API_KEY}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = (await response.json()) as USDASearchResponse;
          if (data.foods && data.foods.length > 0) {
            foods = data.foods;
            break;
          }
        }
      }
    }

    return foods.map((food) => ({
      fdcId: food.fdcId,
      description: food.description,
      category: food.foodCategory || food.dataType || "Unknown",
      portions: food.foodPortions?.length
        ? food.foodPortions.map((p) => ({
            measure: p.modifier,
            gramWeight: p.gramWeight,
          }))
        : ["100 g (default)"],
      nutrients:
        (food.foodNutrients || [])
          .filter((n) =>
            ["Protein", "Carbohydrate, by difference", "Total lipid (fat)", "Energy"].includes(n.nutrientName)
          )
          .map((n) => ({
            name: n.nutrientName,
            unit: n.unitName,
            value: n.value,
          })) || [],
    }));
  } catch (error) {
    console.error("❌ USDA API exception:", error);
    return [];
  }
}

export class FoodController {
  static async classifyFood(req: any, res: any) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // keyword from query param (?keywords=cheese,meat)
      const keywords = req.query.keywords || "";

      // 1. Get ML prediction
      const formData = new FormData();
      formData.append("file", req.file.buffer, { filename: req.file.originalname });

      const mlResp = await fetch(ML_SERVICE_URL, { method: "POST", body: formData as any });
      if (!mlResp.ok) {
        console.error(`❌ ML Service error: ${mlResp.status}`);
        return res.status(503).json({ error: "ML service unavailable" });
      }

      const mlData = (await mlResp.json()) as MLServiceResponse;

      // Get top prediction
      const topLabel = Object.entries(mlData.top5)
        .sort(([, a], [, b]) => Number(b) - Number(a))[0][0];

      // 2. Get nutrition data from USDA with keywords
      const nutritionData = await getNutritionData(topLabel, keywords);

      // 3. Return results
      return res.json({
        success: true,
        predictions: mlData.top5,
        top_prediction: topLabel,
        nutrition: nutritionData,
      });
    } catch (err) {
      console.error("❌ Food classification error:", err);
      return res.status(500).json({
        error: "Server error",
        message: process.env.NODE_ENV === "development" ? (err as Error).message : undefined,
      });
    }
  }

  // New method to log selected food to database
  static async logSelectedFood(req: any, res: any) {
    try {
      const { 
        userId, 
        selectedFood, 
        portionGrams = 100,
        mealType = 'general'
      } = req.body;

      // Validate required fields
      if (!userId || !selectedFood) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["userId", "selectedFood"]
        });
      }

      // Validate selectedFood structure
      if (!selectedFood.fdcId || !selectedFood.description) {
        return res.status(400).json({
          error: "Invalid selectedFood format",
          required: ["fdcId", "description", "nutrients"]
        });
      }

      // Extract nutrition values
      const nutrients = selectedFood.nutrients || [];
      const protein = nutrients.find((n: any) => n.name === "Protein")?.value || 0;
      const carbs = nutrients.find((n: any) => n.name === "Carbohydrate, by difference")?.value || 0;
      const fat = nutrients.find((n: any) => n.name === "Total lipid (fat)")?.value || 0;
      const kcal = nutrients.find((n: any) => n.name === "Energy")?.value || 0;

      // Start a transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create or find the food entry
        let food = await tx.foods.findFirst({
          where: { name: selectedFood.description }
        });

        if (!food) {
          // Create new food entry with nutrition per 100g
          food = await tx.foods.create({
            data: {
              name: selectedFood.description,
              kcal_100g: kcal,
              protein_100g: protein,
              carbs_100g: carbs,
              fat_100g: fat,
              brand: selectedFood.category || null
            }
          });
        }

        // 2. Create a meal entry
        const meal = await tx.meals.create({
          data: {
            user_id: BigInt(userId),
            date_time: new Date(),
            type: mealType,
            source: 'food_classification',
            ai_notes_json: {
              fdcId: selectedFood.fdcId,
              originalDescription: selectedFood.description,
              category: selectedFood.category,
              classificationConfidence: req.body.classificationConfidence || null
            }
          }
        });

        // 3. Create meal item
        await tx.meal_items.create({
          data: {
            meal_id: meal.id,
            food_id: food.id,
            qty_grams: portionGrams
          }
        });

        // 4. Calculate actual nutrition values based on portion
        const portionMultiplier = portionGrams / 100;
        const actualKcal = kcal * portionMultiplier;
        const actualProtein = protein * portionMultiplier;
        const actualCarbs = carbs * portionMultiplier;
        const actualFat = fat * portionMultiplier;

        // 5. Create user food log
        await tx.user_food_logs.create({
          data: {
            user_id: BigInt(userId),
            meal_id: meal.id,
            food_id: food.id,
            qty_grams: portionGrams,
            kcal_snapshot: actualKcal,
            protein_snapshot: actualProtein,
            carbs_snapshot: actualCarbs,
            fat_snapshot: actualFat
          }
        });

        // 6. Update or create user food summary
        const existingSummary = await tx.user_food_summary.findUnique({
          where: {
            user_id_food_id: {
              user_id: BigInt(userId),
              food_id: food.id
            }
          }
        });

        if (existingSummary) {
          await tx.user_food_summary.update({
            where: {
              user_id_food_id: {
                user_id: BigInt(userId),
                food_id: food.id
              }
            },
            data: {
              times_eaten: existingSummary.times_eaten + 1,
              total_grams: existingSummary.total_grams.add(portionGrams),
              avg_portion_grams: existingSummary.total_grams.add(portionGrams).div(existingSummary.times_eaten + 1),
              last_eaten_at: new Date(),
              last_meal_id: meal.id,
              updated_at: new Date()
            }
          });
        } else {
          await tx.user_food_summary.create({
            data: {
              user_id: BigInt(userId),
              food_id: food.id,
              times_eaten: 1,
              total_grams: portionGrams,
              avg_portion_grams: portionGrams,
              first_eaten_at: new Date(),
              last_eaten_at: new Date(),
              last_meal_id: meal.id
            }
          });
        }

        return {
          food,
          meal,
          nutrition: {
            kcal: actualKcal,
            protein: actualProtein,
            carbs: actualCarbs,
            fat: actualFat,
            portion_grams: portionGrams
          }
        };
      });

      console.log(`✅ Food logged: ${result.food.name} (${portionGrams}g) for user ${userId}`);

      return res.json({
        success: true,
        message: "Food logged successfully",
        data: result
      });

    } catch (err) {
      console.error("❌ Food logging error:", err);
      return res.status(500).json({
        error: "Server error",
        message: process.env.NODE_ENV === "development" ? (err as Error).message : undefined,
      });
    }
  }
}
