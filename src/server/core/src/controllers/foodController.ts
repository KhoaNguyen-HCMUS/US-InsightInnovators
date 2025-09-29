import { Request, Response } from "express";
import { serializeBigIntObject } from "../utils/serialization";

const prisma = require("../../prisma/client");

export class FoodController {
  // GET /foods?query=&page=1&pageSize=20
  static async searchFoods(req: Request, res: Response) {
    try {
      const query = (req.query.query as string) || "";
      const page = Math.max(1, Number(req.query.page || 1));
      const pageSize = Math.min(
        50,
        Math.max(1, Number(req.query.pageSize || 20))
      );

      const where = query
        ? { name: { contains: query, mode: "insensitive" as const } }
        : {};

      const [items, total] = await Promise.all([
        prisma.foods.findMany({
          where,
          orderBy: { name: "asc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.foods.count({ where }),
      ]);

      // Serialize BigInt fields
      const serializedItems = serializeBigIntObject(items);
      res.json({ items: serializedItems, page, pageSize, total });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /foods/:id
  static async getFoodById(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id);
      const food = await prisma.foods.findUnique({ where: { id } });
      if (!food) return res.status(404).json({ error: "Not found" });

      // Serialize BigInt fields
      const serializedFood = serializeBigIntObject(food);
      res.json(serializedFood);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /foods/recommend - Personalized food suggestions
  static async recommendFoods(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const { meal_type, target_calories, exclude_allergens } = req.query;

      // Get user profile for personalization
      const profile = await prisma.profiles.findUnique({ where: { user_id } });

      let whereClause: any = {};

      // Filter by calorie range
      if (target_calories) {
        const target = Number(target_calories);
        whereClause.kcal_100g = {
          gte: target * 0.5,
          lte: target * 1.5,
        };
      }

      // Get foods
      const foods = await prisma.foods.findMany({
        where: whereClause,
        orderBy: { protein_100g: "desc" },
        take: 15,
      });

      // Filter and score foods based on user profile
      const recommendations = foods
        .filter((food: any) => isFoodSafeForUser(food, profile))
        .map((food: any) => ({
          ...food,
          recommendation_score: calculateFoodScore(
            food,
            profile,
            meal_type as string
          ),
          why_recommended: generateFoodReason(
            food,
            profile,
            meal_type as string
          ),
          portion_suggestion: suggestOptimalPortion(
            food,
            target_calories as string
          ),
        }))
        .sort(
          (a: any, b: any) => b.recommendation_score - a.recommendation_score
        )
        .slice(0, 10);

      // Serialize BigInt fields
      const serializedRecommendations = serializeBigIntObject(recommendations);
      res.json({ recommendations: serializedRecommendations });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /foods/:id/alternatives - Safe alternatives for allergies
  static async getFoodAlternatives(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id);
      const user_id = (req as any).userId as bigint;

      const [originalFood, profile] = await Promise.all([
        prisma.foods.findUnique({ where: { id } }),
        prisma.profiles.findUnique({ where: { user_id } }),
      ]);

      if (!originalFood)
        return res.status(404).json({ error: "Food not found" });

      // Find nutritionally similar foods
      const alternatives = await prisma.foods.findMany({
        where: {
          id: { not: id },
          kcal_100g: {
            gte: Number(originalFood.kcal_100g) * 0.7,
            lte: Number(originalFood.kcal_100g) * 1.3,
          },
        },
        orderBy: { protein_100g: "desc" },
        take: 10,
      });

      // Filter safe alternatives
      const safeAlternatives = alternatives
        .filter((alt: any) => isFoodSafeForUser(alt, profile))
        .map((alt: any) => ({
          ...alt,
          similarity_score: calculateNutritionSimilarity(originalFood, alt),
          why_alternative: generateAlternativeReason(originalFood, alt),
        }))
        .sort((a: any, b: any) => b.similarity_score - a.similarity_score)
        .slice(0, 5);

      // Serialize BigInt fields
      const serializedOriginal = serializeBigIntObject(originalFood);
      const serializedAlternatives = serializeBigIntObject(safeAlternatives);

      res.json({
        original: serializedOriginal,
        alternatives: serializedAlternatives,
        user_constraints: extractUserConstraints(profile),
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /foods/nutrients/gaps - Nutrient deficiency analysis
  static async analyzeNutrientGaps(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const { days = 7 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));

      // Get recent food logs with nutrition data
      const logs = await prisma.user_food_logs.findMany({
        where: {
          user_id,
          created_at: { gte: startDate },
        },
        include: { foods: true },
      });

      if (logs.length === 0) {
        return res.json({
          message: "Chưa có dữ liệu dinh dưỡng để phân tích",
          recommendations: [
            "Hãy bắt đầu log meals để được phân tích dinh dưỡng",
          ],
        });
      }

      // Calculate daily nutrient averages
      const nutrientTotals = calculateNutrientTotals(logs, Number(days));
      const profile = await prisma.profiles.findUnique({ where: { user_id } });
      const rda = getRDAForUser(profile);

      // Analyze gaps
      const gaps = Object.keys(rda).map((nutrient) => {
        const current = nutrientTotals[nutrient] || 0;
        const recommended = rda[nutrient];
        const percentage = (current / recommended) * 100;

        return {
          nutrient,
          current_intake: Math.round(current * 100) / 100,
          recommended,
          percentage: Math.round(percentage),
          status:
            percentage >= 80
              ? "đủ"
              : percentage >= 50
              ? "thiếu nhẹ"
              : "thiếu nhiều",
          food_sources: getFoodSourcesForNutrient(nutrient),
        };
      });

      // Get food recommendations for deficient nutrients
      const deficientNutrients = gaps.filter((gap) => gap.percentage < 80);
      const foodRecommendations = await generateNutrientFoodRecommendations(
        deficientNutrients,
        profile
      );

      // Serialize BigInt fields
      const serializedFoodRecommendations =
        serializeBigIntObject(foodRecommendations);

      res.json({
        analysis_period: `${days} ngày`,
        nutrient_status: gaps,
        deficiencies: deficientNutrients.map((g) => g.nutrient),
        food_recommendations: serializedFoodRecommendations,
        overall_score: calculateNutritionScore(gaps),
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

// Helper functions for enhanced FoodController
function isFoodSafeForUser(food: any, profile: any): boolean {
  if (!profile) return true;

  const allergies = profile.allergies_json || {};
  const foodName = food.name.toLowerCase();

  // Check allergies
  if (allergies.nuts && (foodName.includes("hạt") || foodName.includes("lạc")))
    return false;
  if (
    allergies.dairy &&
    (foodName.includes("sữa") || foodName.includes("phô mai"))
  )
    return false;
  if (
    allergies.gluten &&
    (foodName.includes("lúa mì") || foodName.includes("bánh mì"))
  )
    return false;
  if (
    allergies.shellfish &&
    (foodName.includes("tôm") || foodName.includes("cua"))
  )
    return false;

  return true;
}

function calculateFoodScore(food: any, profile: any, mealType: string): number {
  let score = 50;

  // Nutrition density
  const protein = Number(food.protein_100g) || 0;
  const fiber = Number(food.fiber_100g) || 0;
  const calories = Number(food.kcal_100g) || 0;

  if (protein > 15) score += 20;
  if (fiber > 5) score += 15;

  // Goal alignment
  if (profile?.goal === "lose" && calories < 200) score += 15;
  if (profile?.goal === "gain" && calories > 300) score += 15;

  // Meal type bonus
  if (mealType === "breakfast" && Number(food.carbs_100g) > 20) score += 10;
  if (mealType === "post_workout" && protein > 20) score += 20;

  return Math.min(100, score);
}

function generateFoodReason(food: any, profile: any, mealType: string): string {
  const reasons = [];

  if (Number(food.protein_100g) > 15) reasons.push("giàu protein");
  if (Number(food.fiber_100g) > 5) reasons.push("nhiều chất xơ");
  if (Number(food.kcal_100g) < 200 && profile?.goal === "lose")
    reasons.push("ít calories");
  if (mealType === "breakfast") reasons.push("phù hợp bữa sáng");

  return reasons.length > 0
    ? `Được đề xuất vì ${reasons.join(", ")}`
    : "Cân bằng dinh dưỡng";
}

function suggestOptimalPortion(food: any, targetCalories: string): string {
  if (!targetCalories) return "100g";

  const target = Number(targetCalories);
  const foodCals = Number(food.kcal_100g) || 100;
  const portion = Math.round((target / foodCals) * 100);

  return `${Math.max(50, Math.min(300, portion))}g`;
}

function calculateNutritionSimilarity(original: any, alternative: any): number {
  const metrics = ["kcal_100g", "protein_100g", "carbs_100g", "fat_100g"];
  let similarity = 0;

  metrics.forEach((metric) => {
    const orig = Number(original[metric]) || 0;
    const alt = Number(alternative[metric]) || 0;
    const diff = Math.abs(orig - alt) / Math.max(orig, 1);
    similarity += (1 - diff) * 25;
  });

  return Math.max(0, Math.round(similarity));
}

function generateAlternativeReason(original: any, alternative: any): string {
  const reasons = [];

  if (Number(alternative.protein_100g) > Number(original.protein_100g)) {
    reasons.push("nhiều protein hơn");
  }
  if (Number(alternative.kcal_100g) < Number(original.kcal_100g)) {
    reasons.push("ít calories hơn");
  }
  if (Number(alternative.fiber_100g) > Number(original.fiber_100g)) {
    reasons.push("nhiều chất xơ hơn");
  }

  return reasons.length > 0 ? reasons.join(", ") : "tương tự về dinh dưỡng";
}

function extractUserConstraints(profile: any): any {
  return {
    allergies: profile?.allergies_json || {},
    health_conditions: profile?.conditions_json || {},
    dietary_preferences: profile?.preferences_json || {},
  };
}

function calculateNutrientTotals(
  logs: any[],
  days: number
): Record<string, number> {
  const totals: Record<string, number> = {};

  logs.forEach((log: any) => {
    const ratio = Number(log.qty_grams) / 100;
    const food = log.foods;

    ["protein", "fiber", "vitamin_c", "calcium", "iron"].forEach((nutrient) => {
      const key = `${nutrient}_100g`;
      if (food[key]) {
        totals[nutrient] = (totals[nutrient] || 0) + Number(food[key]) * ratio;
      }
    });
  });

  // Convert to daily averages
  Object.keys(totals).forEach((key) => {
    totals[key] = totals[key] / days;
  });

  return totals;
}

function getRDAForUser(profile: any): Record<string, number> {
  const sex = profile?.sex || "female";
  const age = 25; // Default age

  return {
    protein: sex === "male" ? 56 : 46,
    fiber: 25,
    vitamin_c: sex === "male" ? 90 : 75,
    calcium: 1000,
    iron: sex === "male" ? 8 : 18,
  };
}

function getFoodSourcesForNutrient(nutrient: string): string[] {
  const sources: Record<string, string[]> = {
    protein: ["thịt", "cá", "trứng", "đậu", "sữa"],
    fiber: ["rau xanh", "trái cây", "yến mạch", "ngũ cốc nguyên hạt"],
    vitamin_c: ["cam", "ổi", "ớt chuông", "cà chua", "kiwi"],
    calcium: ["sữa", "pho mát", "rau cải", "cá nhỏ có xương"],
    iron: ["thịt đỏ", "rau bina", "đậu lăng", "gan"],
  };

  return sources[nutrient] || [];
}

async function generateNutrientFoodRecommendations(
  deficientNutrients: any[],
  profile: any
): Promise<any[]> {
  const recommendations = [];

  for (const nutrient of deficientNutrients) {
    const nutrientKey = `${nutrient.nutrient}_100g`;

    try {
      const foods = await prisma.foods.findMany({
        where: {
          [nutrientKey]: { gt: 0 },
        },
        orderBy: { [nutrientKey]: "desc" },
        take: 3,
      });

      const safeFoods = foods.filter((food: any) =>
        isFoodSafeForUser(food, profile)
      );

      if (safeFoods.length > 0) {
        recommendations.push({
          nutrient: nutrient.nutrient,
          status: nutrient.status,
          recommended_foods: safeFoods.map((food: any) => ({
            name: food.name,
            nutrient_content: Number(food[nutrientKey]),
            serving_suggestion: "100g",
          })),
        });
      }
    } catch (error) {
      // Skip if nutrient column doesn't exist
    }
  }

  return recommendations;
}

function calculateNutritionScore(gaps: any[]): number {
  const totalScore = gaps.reduce(
    (sum, gap) => sum + Math.min(100, gap.percentage),
    0
  );
  return Math.round(totalScore / gaps.length);
}

export default FoodController;
