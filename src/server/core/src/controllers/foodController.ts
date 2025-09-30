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
      category: food.foodCategory || food.dataType || "Unknown"
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

      // Get authenticated user (optional)
      const userId = req.user?.id;
      const userEmail = req.user?.email;

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
        user: userId ? {
          isAuthenticated: true,
          email: userEmail
        } : {
          isAuthenticated: false,
          message: "Log in to see your personalized food history and save meals"
        }
      });
    } catch (err) {
      console.error("❌ Food classification error:", err);
      return res.status(500).json({
        error: "Server error",
        message: process.env.NODE_ENV === "development" ? (err as Error).message : undefined,
      });
    }
  }

  static async getFoodDetail(req: any, res: any) {
    try {
      const { fdcId } = req.body;

      if (!fdcId) {
        return res.status(400).json({ error: "Missing required field: fdcId" });
      }

      const url = `${USDA_BASE}/food/${fdcId}?api_key=${USDA_API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(502).json({ error: "Failed to fetch food details from USDA" });
      }

      const food = await response.json() as any;

      // Extract nutrients (per 100 g) - USDA API structure: foodNutrients[].nutrient.name and amount
      const nutrients = food.foodNutrients || [];
      
      // Find specific nutrients by exact name matching
      const kcalNutrient = nutrients.find((n: any) => 
        n.nutrient?.name === "Energy" && n.nutrient?.unitName === "kcal"
      );
      const kcal100 = kcalNutrient?.amount || 0;
      
      const proteinNutrient = nutrients.find((n: any) => 
        n.nutrient?.name === "Protein"
      );
      const protein100 = proteinNutrient?.amount || 0;
      
      const carbsNutrient = nutrients.find((n: any) => 
        n.nutrient?.name === "Carbohydrate, by difference"
      );
      const carbs100 = carbsNutrient?.amount || 0;
      
      const fatNutrient = nutrients.find((n: any) => 
        n.nutrient?.name === "Total lipid (fat)"
      );
      const fat100 = fatNutrient?.amount || 0;

      // Process portions with nutrition per portion
      const portions = (food.foodPortions || []).map((p: any) => {
        const grams = p.gramWeight || 100;
        const multiplier = grams / 100;

        return {
          id: p.id || 0,
          description: p.portionDescription || p.modifier || "Unknown portion",
          gramWeight: grams,
          nutrition: {
            kcal: Math.round(kcal100 * multiplier),
            protein: Math.round(protein100 * multiplier * 10) / 10,
            carbs: Math.round(carbs100 * multiplier * 10) / 10,
            fat: Math.round(fat100 * multiplier * 10) / 10,
          },
        };
      });

      // Always include a 100g default if not present
      if (!portions.some((p: any) => p.gramWeight === 100)) {
        portions.unshift({
          id: -1,
          description: "100 g (default)",
          gramWeight: 100,
          nutrition: {
            kcal: Math.round(kcal100),
            protein: Math.round(protein100 * 10) / 10,
            carbs: Math.round(carbs100 * 10) / 10,
            fat: Math.round(fat100 * 10) / 10,
          },
        });
      }

      return res.json({
        success: true,
        data: {
          fdcId: food.fdcId,
          name: food.description,
          category: food.foodCategory || food.dataType,
          nutrientsPer100g: { 
            kcal: Math.round(kcal100), 
            protein: Math.round(protein100 * 10) / 10, 
            carbs: Math.round(carbs100 * 10) / 10, 
            fat: Math.round(fat100 * 10) / 10 
          },
          portions,
        },
      });
    } catch (err) {
      return res.status(500).json({
        error: "Server error",
        message: (err as Error).message,
      });
    }
  }

  // Log selected food to database (simplified - only foods and user_food_logs tables)
  static async logSelectedFood(req: any, res: any) {
    try {
      // Get user ID from authenticated request
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          error: "Authentication required",
          message: "User must be logged in to log food"
        });
      }

      const { 
        fdcId, 
        portionId,
        confirmConsumption = false
      } = req.body;

      // Check if user confirmed they actually consumed the food
      if (!confirmConsumption) {
        return res.status(400).json({
          error: "Consumption confirmation required",
          message: "Set confirmConsumption: true to log food as consumed"
        });
      }

      // Validate required fields
      if (!fdcId || portionId == null) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["fdcId", "portionId"]
        });
      }

      // Fetch food data from USDA API
      const url = `${USDA_BASE}/food/${fdcId}?api_key=${USDA_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(502).json({ error: "Failed to fetch food details from USDA" });
      }

      const food = await response.json() as any;

      // Extract nutrients (per 100g) - USDA API structure: foodNutrients[].nutrient.name and amount
      const nutrients = food.foodNutrients || [];
      
      const kcalNutrient = nutrients.find((n: any) => 
        n.nutrient?.name === "Energy" && n.nutrient?.unitName === "kcal"
      );
      const kcal = kcalNutrient?.amount || 0;
      
      const proteinNutrient = nutrients.find((n: any) => 
        n.nutrient?.name === "Protein"
      );
      const protein = proteinNutrient?.amount || 0;
      
      const carbsNutrient = nutrients.find((n: any) => 
        n.nutrient?.name === "Carbohydrate, by difference"
      );
      const carbs = carbsNutrient?.amount || 0;
      
      const fatNutrient = nutrients.find((n: any) => 
        n.nutrient?.name === "Total lipid (fat)"
      );
      const fat = fatNutrient?.amount || 0;

      // Find the selected portion
      const portions = food.foodPortions || [];
      const selectedPortion = portions.find((p: any) => p.id === portionId);
      
      let portionGrams: number;
      let portionDescription: string;

      if (selectedPortion) {
        portionGrams = selectedPortion.gramWeight;
        portionDescription = selectedPortion.portionDescription || selectedPortion.modifier || "Unknown portion";
      } else if (portionId === -1) {
        // Default 100g portion
        portionGrams = 100;
        portionDescription = "100g";
      } else {
        return res.status(404).json({ error: "Portion not found" });
      }

      // Calculate actual nutrition values based on portion
      const portionMultiplier = portionGrams / 100;
      const actualKcal = Math.round(kcal * portionMultiplier);
      const actualProtein = Math.round(protein * portionMultiplier * 10) / 10;
      const actualCarbs = Math.round(carbs * portionMultiplier * 10) / 10;
      const actualFat = Math.round(fat * portionMultiplier * 10) / 10;

      // Simplified transaction - only foods and user_food_logs tables
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create or find the food entry
        let foodEntry = await tx.foods.findFirst({
          where: { name: food.description }
        });

        if (!foodEntry) {
          // Create new food entry with nutrition per 100g
          foodEntry = await tx.foods.create({
            data: {
              name: food.description,
              kcal_100g: kcal,
              protein_100g: protein,
              carbs_100g: carbs,
              fat_100g: fat,
              brand: food.foodCategory || food.dataType || null
            }
          });
        }

        // 2. Create user food log (no meal tracking or summary updates)
        const foodLog = await tx.user_food_logs.create({
          data: {
            user_id: BigInt(userId),
            food_id: foodEntry.id,
            qty_grams: portionGrams,
            kcal_snapshot: actualKcal,
            protein_snapshot: actualProtein,
            carbs_snapshot: actualCarbs,
            fat_snapshot: actualFat,
            // meal_id is optional, leaving it null for direct food logging
          }
        });

        return {
          food: foodEntry,
          foodLog,
          nutrition: {
            kcal: actualKcal,
            protein: actualProtein,
            carbs: actualCarbs,
            fat: actualFat,
            portion_grams: portionGrams,
            portion_description: portionDescription
          }
        };
      });

      return res.json({
        success: true,
        message: "Food consumption logged successfully",
        data: {
          food: {
            id: result.food.id.toString(),
            name: result.food.name,
            fdcId: fdcId,
            kcal_100g: Number(result.food.kcal_100g),
            protein_100g: Number(result.food.protein_100g),
            carbs_100g: Number(result.food.carbs_100g),
            fat_100g: Number(result.food.fat_100g)
          },
          log: {
            id: result.foodLog.id.toString(),
            portionGrams: Number(result.foodLog.qty_grams),
            portionDescription: portionDescription,
            loggedAt: result.foodLog.created_at
          },
          nutrition: result.nutrition
        }
      });

    } catch (err) {
      console.error("❌ Food logging error:", err);
      return res.status(500).json({
        error: "Server error",
        message: process.env.NODE_ENV === "development" ? (err as Error).message : undefined,
      });
    }
  }

  // Get user's food history and stats
  static async getUserFoodHistory(req: any, res: any) {
    try {
      // Get user ID from authenticated request
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          error: "Authentication required",
          message: "User must be logged in to view food history"
        });
      }

      const { limit = 20, days = 30 } = req.query;
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

      // Get recent food logs
      const recentLogs = await prisma.user_food_logs.findMany({
        where: {
          user_id: BigInt(userId),
          created_at: {
            gte: daysAgo
          }
        },
        include: {
          foods: {
            select: {
              name: true,
              kcal_100g: true,
              protein_100g: true,
              carbs_100g: true,
              fat_100g: true
            }
          },
          meals: {
            select: {
              type: true,
              date_time: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: parseInt(limit as string)
      });

      // Get food summary stats
      const foodSummary = await prisma.user_food_summary.findMany({
        where: {
          user_id: BigInt(userId)
        },
        include: {
          foods: {
            select: {
              name: true,
              kcal_100g: true,
              protein_100g: true,
              carbs_100g: true,
              fat_100g: true
            }
          }
        },
        orderBy: [
          { times_eaten: 'desc' },
          { last_eaten_at: 'desc' }
        ],
        take: 10
      });

      // Calculate daily averages
      const totalLogs = recentLogs.length;
      const totalKcal = recentLogs.reduce((sum, log) => sum + Number(log.kcal_snapshot || 0), 0);
      const totalProtein = recentLogs.reduce((sum, log) => sum + Number(log.protein_snapshot || 0), 0);
      const totalCarbs = recentLogs.reduce((sum, log) => sum + Number(log.carbs_snapshot || 0), 0);
      const totalFat = recentLogs.reduce((sum, log) => sum + Number(log.fat_snapshot || 0), 0);

      const stats = {
        totalLogsInPeriod: totalLogs,
        dailyAverages: {
          kcal: totalLogs > 0 ? Math.round(totalKcal / Math.min(parseInt(days as string), totalLogs)) : 0,
          protein: totalLogs > 0 ? Math.round(totalProtein / Math.min(parseInt(days as string), totalLogs)) : 0,
          carbs: totalLogs > 0 ? Math.round(totalCarbs / Math.min(parseInt(days as string), totalLogs)) : 0,
          fat: totalLogs > 0 ? Math.round(totalFat / Math.min(parseInt(days as string), totalLogs)) : 0
        }
      };

      return res.json({
        success: true,
        data: {
          recentLogs: recentLogs.map(log => ({
            id: log.id.toString(),
            foodName: log.foods.name,
            portionGrams: Number(log.qty_grams),
            nutrition: {
              kcal: Number(log.kcal_snapshot || 0),
              protein: Number(log.protein_snapshot || 0),
              carbs: Number(log.carbs_snapshot || 0),
              fat: Number(log.fat_snapshot || 0)
            },
            mealType: log.meals?.type || 'general',
            loggedAt: log.created_at,
            mealTime: log.meals?.date_time
          })),
          favoriteFood: foodSummary.map(summary => ({
            foodName: summary.foods.name,
            timesEaten: summary.times_eaten,
            totalGrams: Number(summary.total_grams),
            avgPortionGrams: Number(summary.avg_portion_grams || 0),
            firstEaten: summary.first_eaten_at,
            lastEaten: summary.last_eaten_at
          })),
          stats
        }
      });

    } catch (err) {
      console.error("❌ Food history error:", err);
      return res.status(500).json({
        error: "Server error",
        message: process.env.NODE_ENV === "development" ? (err as Error).message : undefined,
      });
    }
  }
}
