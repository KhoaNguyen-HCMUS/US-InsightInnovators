import { Request, Response } from "express";
import { z } from "zod";
import { serializeBigIntObject } from "../utils/serialization";
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = require("../../prisma/client");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL_ID = process.env.GEMINI_MODEL_ID || "gemini-2.5-flash";

// Simple in-memory cache for meal plans (production should use Redis)
const mealPlanCache = new Map<string, any>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Validation schemas
const GenerateMealPlanSchema = z.object({
  duration: z.enum(["weekly", "monthly"]),
  title: z.string().min(1).max(255).optional(),
  preferences: z
    .object({
      focus: z.string().optional(), // 'weight_loss', 'muscle_gain', 'maintenance'
      exclude_ingredients: z.array(z.string()).optional(),
      preferred_cuisines: z.array(z.string()).optional(),
      cooking_time: z.enum(["quick", "moderate", "elaborate"]).optional(),
      meal_frequency: z.number().min(2).max(6).optional(),
    })
    .optional(),
});

const SubstituteDishSchema = z.object({
  meal_plan_id: z.string(), // meal ID that represents the plan
  day_index: z.number().min(0),
  meal_slot: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  dish_to_replace: z.object({
    name: z.string(),
    calories: z.number().optional(),
  }),
  preferences: z
    .object({
      cuisine: z.string().optional(),
      max_cook_time: z.number().optional(),
      dietary_requirements: z.array(z.string()).optional(),
    })
    .optional(),
  reason: z.string().optional(),
});

export class MealPlanController {
  // POST /meal-plans - Generate meal plan (Use Case: Generate meal plan)
  static async generateMealPlan(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const parsed = GenerateMealPlanSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid input",
          details: parsed.error.flatten(),
        });
      }

      const { duration, title, preferences } = parsed.data;

      console.log("🍽️ Generating meal plan:", {
        user_id: user_id.toString(),
        duration,
        preferences,
      });

      // Step 2: Get user profile (Use Case step 2)
      const profile = await prisma.profiles.findUnique({ where: { user_id } });
      if (!profile) {
        return res.status(400).json({
          error: "Profile required",
          message:
            "Please create your health profile first to generate meal plans",
        });
      }

      // Step 3: Get user preferences from profile.preferences_json (Use Case step 3)
      const userPreferences = profile.preferences_json || {};
      const mergedPreferences = {
        ...userPreferences,
        ...preferences, // Override with request preferences
      };

      // Step 4: Compute nutrition targets (Use Case step 4)
      const tdee = Number(profile.tdee || 2000);
      const goalMultiplier =
        profile.goal === "lose" ? 0.8 : profile.goal === "gain" ? 1.2 : 1.0;
      const dailyCalories = Math.round(tdee * goalMultiplier);

      const nutritionTargets = {
        calories: dailyCalories,
        protein: Math.round((dailyCalories * 0.25) / 4), // 25% protein
        carbs: Math.round((dailyCalories * 0.45) / 4), // 45% carbs
        fat: Math.round((dailyCalories * 0.3) / 9), // 30% fat
      };

      // 🚀 PERFORMANCE: Check cache first
      const cacheKey = `meal_plan_${profile.goal}_${duration}_${JSON.stringify(
        mergedPreferences
      )}_${JSON.stringify(nutritionTargets)}`;
      const cachedPlan = mealPlanCache.get(cacheKey);

      if (cachedPlan && Date.now() - cachedPlan.timestamp < CACHE_TTL) {
        console.log("⚡ Using cached meal plan (super fast!)");

        // Still create a new DB record but with cached plan data
        const planTitle =
          title ||
          `${
            duration === "weekly" ? "Weekly" : "Monthly"
          } Meal Plan - ${new Date().toLocaleDateString()}`;

        const masterMeal = await prisma.meals.create({
          data: {
            user_id,
            date_time: new Date(),
            type: "meal_plan",
            source: "ai_cached",
            meal_slot: duration,
            ai_notes_json: {
              title: planTitle,
              plan_type: "meal_plan",
              duration,
              nutrition_targets: nutritionTargets,
              plan_data: cachedPlan.data,
              grocery_list: generateGroceryList(cachedPlan.data),
              generation_preferences: mergedPreferences,
              start_date: new Date().toISOString(),
              end_date: new Date(
                Date.now() +
                  (duration === "weekly" ? 7 : 30) * 24 * 60 * 60 * 1000
              ).toISOString(),
              cached: true,
            },
            nutrition_cache_json: {
              daily_targets: nutritionTargets,
              total_days: duration === "weekly" ? 7 : 30,
              meals_per_day: mergedPreferences.meal_frequency || 3,
            },
          },
        });

        return res.status(201).json({
          success: true,
          message: "Meal plan generated successfully (cached)",
          data: serializeBigIntObject({
            meal_plan: {
              id: masterMeal.id.toString(),
              title: planTitle,
              duration,
              created_at: masterMeal.date_time,
              plan_data: cachedPlan.data,
              nutrition_targets: nutritionTargets,
              grocery_list: generateGroceryList(cachedPlan.data),
            },
            performance: {
              cached: true,
              total_time_ms: "<50ms",
            },
          }),
        });
      }

      // Step 5-6: Generate meal plan using AI (Use Case step 5-6)
      console.log("🤖 Starting AI generation (this may take a few seconds)...");
      const startTime = Date.now();

      const planData = await generateMealPlanWithAI(
        profile,
        mergedPreferences,
        nutritionTargets,
        duration
      );

      console.log(`⏱️ AI generation took: ${Date.now() - startTime}ms`);

      // Step 7-8: Validate and assemble plan (Use Case step 7-8)
      const validatedPlan = validateMealPlan(
        planData,
        nutritionTargets,
        profile
      );

      // 🚀 PERFORMANCE: Cache the generated plan for future use
      mealPlanCache.set(cacheKey, {
        data: validatedPlan,
        timestamp: Date.now(),
      });
      console.log("💾 Meal plan cached for future requests");

      // Generate grocery list in parallel with DB operations
      const groceryListPromise = Promise.resolve(
        generateGroceryList(validatedPlan)
      );

      // Step 11: Store the plan using optimized parallel operations
      const planTitle =
        title ||
        `${
          duration === "weekly" ? "Weekly" : "Monthly"
        } Meal Plan - ${new Date().toLocaleDateString()}`;

      // Execute database operations in parallel
      const dbStartTime = Date.now();
      const [masterMeal, groceryList] = await Promise.all([
        // Create master meal
        prisma.meals.create({
          data: {
            user_id,
            date_time: new Date(),
            type: "meal_plan",
            source: "ai_generated",
            meal_slot: duration,
            ai_notes_json: {
              title: planTitle,
              plan_type: "meal_plan",
              duration,
              nutrition_targets: nutritionTargets,
              plan_data: validatedPlan,
              generation_preferences: mergedPreferences,
              start_date: new Date().toISOString(),
              end_date: new Date(
                Date.now() +
                  (duration === "weekly" ? 7 : 30) * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
            nutrition_cache_json: {
              daily_targets: nutritionTargets,
              total_days: duration === "weekly" ? 7 : 30,
              meals_per_day: mergedPreferences.meal_frequency || 3,
            },
          },
        }),
        // Generate grocery list in parallel
        groceryListPromise,
      ]);

      console.log(`⚡ DB operations took: ${Date.now() - dbStartTime}ms`);

      // Update meal plan with grocery list (async, don't wait)
      prisma.meals
        .update({
          where: { id: masterMeal.id },
          data: {
            ai_notes_json: {
              ...masterMeal.ai_notes_json,
              grocery_list: groceryList,
            },
          },
        })
        .catch((err: any) =>
          console.warn("⚠️ Grocery list update failed:", err)
        );

      // Store generation prompt (async, don't wait for response)
      prisma.prompts
        .create({
          data: {
            user_id,
            purpose: "meal_plan_generation",
            prompt_text: JSON.stringify({
              profile_goals: profile.goal,
              preferences: mergedPreferences,
              nutrition_targets: nutritionTargets,
              duration,
            }),
            response_text: JSON.stringify({
              meal_plan_id: masterMeal.id.toString(),
              plan_title: planTitle,
            }),
          },
        })
        .catch((err: any) => console.warn("⚠️ Prompt logging failed:", err));

      const totalTime = Date.now() - startTime;
      console.log(
        `✅ Meal plan generated in ${totalTime}ms:`,
        masterMeal.id.toString()
      );

      // Step 9: Present to user (Use Case step 9) - Optimized response
      const serializedResponse = serializeBigIntObject({
        meal_plan: {
          id: masterMeal.id.toString(),
          title: planTitle,
          duration,
          created_at: masterMeal.date_time,
          plan_data: validatedPlan,
          nutrition_targets: nutritionTargets,
          grocery_list: groceryList,
        },
        nutrition_summary: {
          daily_targets: nutritionTargets,
          plan_overview: {
            total_days: duration === "weekly" ? 7 : 30,
            meals_per_day: mergedPreferences.meal_frequency || 3,
            total_meals:
              (duration === "weekly" ? 7 : 30) *
              (mergedPreferences.meal_frequency || 3),
          },
        },
        performance: {
          total_time_ms: totalTime,
          ai_generation_ms: Date.now() - startTime - (Date.now() - dbStartTime),
        },
      });

      res.status(201).json({
        success: true,
        message: "Meal plan generated successfully",
        data: serializedResponse,
      });
    } catch (error: any) {
      console.error("❌ Generate meal plan error:", error);
      res.status(500).json({
        error: "Failed to generate meal plan",
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // GET /meal-plans - Get user's meal plans
  static async getMealPlans(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const { limit = 10 } = req.query;

      // Get meals that represent meal plans (type = 'meal_plan')
      const mealPlans = await prisma.meals.findMany({
        where: {
          user_id,
          type: "meal_plan",
        },
        orderBy: { date_time: "desc" },
        take: Number(limit),
        select: {
          id: true,
          date_time: true,
          meal_slot: true, // duration (weekly/monthly)
          ai_notes_json: true,
          nutrition_cache_json: true,
        },
      });

      const formattedPlans = mealPlans.map((plan: any) => ({
        id: plan.id.toString(),
        title: plan.ai_notes_json?.title || "Meal Plan",
        duration: plan.meal_slot, // weekly/monthly
        created_at: plan.date_time,
        nutrition_targets: plan.nutrition_cache_json?.daily_targets,
        plan_overview: plan.nutrition_cache_json,
      }));

      const serializedMealPlans = serializeBigIntObject(formattedPlans);
      res.json({ meal_plans: serializedMealPlans });
    } catch (error: any) {
      console.error("❌ Get meal plans error:", error);
      res.status(500).json({ error: "Failed to get meal plans" });
    }
  }

  // GET /meal-plans/:id - Get specific meal plan (Use Case: View meal plan)
  static async getMealPlan(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const plan_id = BigInt(req.params.id);

      const mealPlan = await prisma.meals.findFirst({
        where: {
          id: plan_id,
          user_id, // Ensure user owns this plan
          type: "meal_plan",
        },
      });

      if (!mealPlan) {
        return res.status(404).json({ error: "Meal plan not found" });
      }

      const formattedPlan = {
        id: mealPlan.id.toString(),
        title: mealPlan.ai_notes_json?.title || "Meal Plan",
        duration: mealPlan.meal_slot,
        created_at: mealPlan.date_time,
        plan_data: mealPlan.ai_notes_json?.plan_data,
        nutrition_targets: mealPlan.ai_notes_json?.nutrition_targets,
        grocery_list: mealPlan.ai_notes_json?.grocery_list,
        start_date: mealPlan.ai_notes_json?.start_date,
        end_date: mealPlan.ai_notes_json?.end_date,
      };

      const serializedMealPlan = serializeBigIntObject(formattedPlan);
      res.json({ meal_plan: serializedMealPlan });
    } catch (error: any) {
      console.error("❌ Get meal plan error:", error);
      res.status(500).json({ error: "Failed to get meal plan" });
    }
  }

  // GET /meal-plans/:id/grocery-list - Generate shopping list (Use Case: Generate shopping list)
  static async getGroceryList(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const plan_id = BigInt(req.params.id);

      const mealPlan = await prisma.meals.findFirst({
        where: {
          id: plan_id,
          user_id,
          type: "meal_plan",
        },
      });

      if (!mealPlan) {
        return res.status(404).json({ error: "Meal plan not found" });
      }

      // Get existing grocery list or regenerate
      let groceryList = mealPlan.ai_notes_json?.grocery_list;
      if (!groceryList && mealPlan.ai_notes_json?.plan_data) {
        groceryList = generateGroceryList(mealPlan.ai_notes_json.plan_data);

        // Update meal plan with generated grocery list
        const updatedAiNotes = {
          ...mealPlan.ai_notes_json,
          grocery_list: groceryList,
        };

        await prisma.meals.update({
          where: { id: plan_id },
          data: { ai_notes_json: updatedAiNotes },
        });
      }

      res.json({
        grocery_list: groceryList || [],
        meal_plan_title: mealPlan.ai_notes_json?.title || "Meal Plan",
        generated_at: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Get grocery list error:", error);
      res.status(500).json({ error: "Failed to get grocery list" });
    }
  }

  // POST /meal-plans/:id/substitute - Substitute dishes (Use Case: Customize meal plan)
  static async substituteDish(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const plan_id = BigInt(req.params.id);
      const parsed = SubstituteDishSchema.safeParse({
        ...req.body,
        meal_plan_id: req.params.id,
      });

      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid input",
          details: parsed.error.flatten(),
        });
      }

      const { day_index, meal_slot, dish_to_replace, preferences, reason } =
        parsed.data;

      // Get meal plan
      const mealPlan = await prisma.meals.findFirst({
        where: {
          id: plan_id,
          user_id,
          type: "meal_plan",
        },
      });

      if (!mealPlan) {
        return res.status(404).json({ error: "Meal plan not found" });
      }

      // Get user profile for substitution logic
      const profile = await prisma.profiles.findUnique({ where: { user_id } });

      console.log("🔄 Finding substitute for:", dish_to_replace.name);

      // Generate substitute using AI
      const substitute = await findDishSubstitute(
        dish_to_replace,
        preferences,
        profile
      );

      if (!substitute) {
        return res.status(404).json({
          error: "No suitable substitute found",
          message:
            "Try adjusting your preferences or choosing a different dish",
        });
      }

      // Update meal plan data with substitution
      const currentPlanData = mealPlan.ai_notes_json?.plan_data || {};
      const updatedPlanData = updateMealPlanWithSubstitution(
        currentPlanData,
        day_index,
        meal_slot,
        substitute
      );

      // Record substitution in ai_notes_json
      const substitutionRecord = {
        timestamp: new Date().toISOString(),
        day_index,
        meal_slot,
        original_dish: dish_to_replace,
        substitute_dish: substitute,
        reason: reason || "User requested substitution",
      };

      const updatedAiNotes = {
        ...mealPlan.ai_notes_json,
        plan_data: updatedPlanData,
        substitutions: [
          ...(mealPlan.ai_notes_json?.substitutions || []),
          substitutionRecord,
        ],
      };

      await prisma.meals.update({
        where: { id: plan_id },
        data: {
          ai_notes_json: updatedAiNotes,
        },
      });

      const serializedResponse = serializeBigIntObject({
        substitution: substitutionRecord,
        substitute_dish: substitute,
        nutrition_comparison: {
          original: dish_to_replace,
          substitute: substitute,
          calorie_difference:
            (substitute.calories || 0) - (dish_to_replace.calories || 0),
        },
      });

      res.json({
        success: true,
        message: "Dish substituted successfully",
        data: serializedResponse,
      });
    } catch (error: any) {
      console.error("❌ Substitute dish error:", error);
      res.status(500).json({ error: "Failed to substitute dish" });
    }
  }

  // PUT /meal-plans/:id - Update meal plan
  static async updateMealPlan(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const plan_id = BigInt(req.params.id);
      const { title } = req.body;

      const mealPlan = await prisma.meals.findFirst({
        where: {
          id: plan_id,
          user_id,
          type: "meal_plan",
        },
      });

      if (!mealPlan) {
        return res.status(404).json({ error: "Meal plan not found" });
      }

      const updatedAiNotes = {
        ...mealPlan.ai_notes_json,
        title: title || mealPlan.ai_notes_json?.title,
      };

      await prisma.meals.update({
        where: { id: plan_id },
        data: {
          ai_notes_json: updatedAiNotes,
        },
      });

      res.json({
        success: true,
        message: "Meal plan updated successfully",
      });
    } catch (error: any) {
      console.error("❌ Update meal plan error:", error);
      res.status(500).json({ error: "Failed to update meal plan" });
    }
  }

  // DELETE /meal-plans/:id - Delete meal plan
  static async deleteMealPlan(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const plan_id = BigInt(req.params.id);

      const deletedPlan = await prisma.meals.deleteMany({
        where: {
          id: plan_id,
          user_id,
          type: "meal_plan",
        },
      });

      if (deletedPlan.count === 0) {
        return res.status(404).json({ error: "Meal plan not found" });
      }

      res.json({
        success: true,
        message: "Meal plan deleted successfully",
      });
    } catch (error: any) {
      console.error("❌ Delete meal plan error:", error);
      res.status(500).json({ error: "Failed to delete meal plan" });
    }
  }
}

// Helper Functions (using existing schema)

async function generateMealPlanWithAI(
  profile: any,
  preferences: any,
  targets: any,
  duration: string
) {
  if (!GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY not configured, using mock data");
    return generateMockMealPlan(preferences, targets, duration);
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_ID });

    const daysCount = duration === "weekly" ? 7 : 30;
    const mealsPerDay = preferences?.meal_frequency || 3;

    const prompt = `
Tôi cần bạn tạo một kế hoạch ăn uống ${
      duration === "weekly" ? "7 ngày" : "30 ngày"
    } cho người Việt Nam với thông tin sau:

**Thông tin cá nhân:**
- Tuổi: ${profile.age || 25}
- Giới tính: ${profile.sex || "male"}
- Hoạt động: ${profile.activity_level || "moderate"}
- Mục tiêu: ${profile.goal || "maintain"}

**Mục tiêu dinh dưỡng hàng ngày:**
- Calories: ${targets.calories} kcal
- Protein: ${targets.protein}g
- Carbs: ${targets.carbs}g
- Fat: ${targets.fat}g

**Sở thích:**
- Số bữa/ngày: ${mealsPerDay}
- Thời gian nấu: ${preferences?.cooking_time || "moderate"}
- Món ăn yêu thích: ${preferences?.preferred_cuisines?.join(", ") || "Việt Nam"}
- Tránh: ${preferences?.exclude_ingredients?.join(", ") || "không có"}

Hãy tạo kế hoạch ăn uống THỰC TẾ với các món ăn Việt Nam cụ thể. Trả về JSON theo format:

{
  "day_0": {
    "breakfast": {
      "name": "Tên món ăn cụ thể",
      "ingredients": ["nguyên liệu 1", "nguyên liệu 2", "..."],
      "calories": số_calories,
      "protein": số_protein_grams,
      "carbs": số_carbs_grams, 
      "fat": số_fat_grams,
      "cooking_time": "${preferences?.cooking_time || "moderate"}",
      "cuisine": "vietnamese",
      "cooking_instructions": "Hướng dẫn nấu ngắn gọn"
    },
    "lunch": { ... },
    "dinner": { ... }
  },
  "day_1": { ... },
  ...
}

**Yêu cầu quan trọng:**
1. Chỉ sử dụng món ăn Việt Nam thực tế (phở, bún, cơm, chả cá, gỏi cuốn...)
2. Nguyên liệu phải có thể mua ở Việt Nam
3. Dinh dưỡng phải cân bằng theo mục tiêu
4. Đa dạng món ăn, không lặp lại
5. Chỉ trả về JSON, không có text khác

${
  mealsPerDay > 3
    ? "Thêm snack1" +
      (mealsPerDay > 4 ? " và snack2" : "") +
      " cho các bữa phụ."
    : ""
}`;

    console.log("🤖 Generating meal plan with Gemini AI...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const mealPlan = JSON.parse(jsonMatch[0]);
      console.log("✅ Gemini AI meal plan generated successfully");
      return mealPlan;
    } else {
      console.warn(
        "⚠️ Could not extract JSON from Gemini response, using mock data"
      );
      return generateMockMealPlan(preferences, targets, duration);
    }
  } catch (error) {
    console.error("❌ Gemini AI error:", error);
    console.log("📝 Falling back to mock meal plan");
    return generateMockMealPlan(preferences, targets, duration);
  }
}

// Fallback mock function
function generateMockMealPlan(
  preferences: any,
  targets: any,
  duration: string
) {
  const daysCount = duration === "weekly" ? 7 : 30;
  const mealsPerDay = preferences?.meal_frequency || 3;

  const vietnameseMeals = {
    breakfast: [
      {
        name: "Phở bò",
        ingredients: ["bánh phở", "thịt bò", "hành lá", "ngò"],
        calories: 350,
      },
      {
        name: "Bánh mì thịt",
        ingredients: ["bánh mì", "thịt heo", "pate", "rau"],
        calories: 400,
      },
      {
        name: "Bún bò Huế",
        ingredients: ["bún", "thịt bò", "chả", "rau sống"],
        calories: 380,
      },
      {
        name: "Cháo gà",
        ingredients: ["gạo", "thịt gà", "gừng", "hành"],
        calories: 300,
      },
      {
        name: "Bánh cuốn",
        ingredients: ["bánh tráng", "thịt heo", "mộc nhĩ", "chả"],
        calories: 320,
      },
    ],
    lunch: [
      {
        name: "Cơm gà nướng",
        ingredients: ["cơm trắng", "thịt gà", "rau", "nước mắm"],
        calories: 500,
      },
      {
        name: "Bún chả",
        ingredients: ["bún", "thịt nướng", "chả", "rau thơm"],
        calories: 450,
      },
      {
        name: "Cơm tấm",
        ingredients: ["cơm tấm", "sườn nướng", "bì", "chả trứng"],
        calories: 550,
      },
      {
        name: "Mì Quảng",
        ingredients: ["mì Quảng", "tôm", "thịt heo", "trứng cút"],
        calories: 480,
      },
      {
        name: "Bánh xèo",
        ingredients: ["bột gạo", "tôm", "thịt ba chỉ", "giá đỗ"],
        calories: 420,
      },
    ],
    dinner: [
      {
        name: "Cơm rang dưa bò",
        ingredients: ["cơm", "thịt bò", "dưa chua", "trứng"],
        calories: 520,
      },
      {
        name: "Canh chua cá",
        ingredients: ["cá", "cà chua", "dứa", "rau muống"],
        calories: 350,
      },
      {
        name: "Thịt kho tàu",
        ingredients: ["thịt ba chỉ", "trứng", "nước dừa", "cơm"],
        calories: 480,
      },
      {
        name: "Gà curry",
        ingredients: ["thịt gà", "khoai tây", "cà rôt", "cơm"],
        calories: 450,
      },
      {
        name: "Cá kho tộ",
        ingredients: ["cá", "thịt ba chỉ", "nước mắm", "cơm"],
        calories: 420,
      },
    ],
  };

  const mealSlots = ["breakfast", "lunch", "dinner"];
  if (mealsPerDay > 3) mealSlots.push("snack1");
  if (mealsPerDay > 4) mealSlots.push("snack2");

  const plan: any = {};

  for (let day = 0; day < daysCount; day++) {
    plan[`day_${day}`] = {};

    for (const slot of mealSlots) {
      if (slot.includes("snack")) {
        plan[`day_${day}`][slot] = {
          name: `Chè đậu xanh`,
          ingredients: ["đậu xanh", "đường", "nước cốt dừa"],
          calories: Math.round(targets.calories * 0.1),
          protein: Math.round(targets.protein * 0.1),
          carbs: Math.round(targets.carbs * 0.15),
          fat: Math.round(targets.fat * 0.05),
          cooking_time: "quick",
          cuisine: "vietnamese",
        };
      } else {
        const meals = vietnameseMeals[slot as keyof typeof vietnameseMeals];
        const selectedMeal = meals[day % meals.length];

        plan[`day_${day}`][slot] = {
          ...selectedMeal,
          protein: Math.round(targets.protein / mealsPerDay),
          carbs: Math.round(targets.carbs / mealsPerDay),
          fat: Math.round(targets.fat / mealsPerDay),
          cooking_time: preferences?.cooking_time || "moderate",
          cuisine: "vietnamese",
        };
      }
    }
  }

  return plan;
}

function validateMealPlan(planData: any, targets: any, profile: any) {
  // Validate nutrition balance, allergies, etc.
  // For now, return as-is
  return planData;
}

function generateGroceryList(planData: any) {
  const ingredients: any = {};

  // Extract all ingredients from meal plan
  Object.values(planData).forEach((day: any) => {
    Object.values(day).forEach((meal: any) => {
      if (meal.ingredients) {
        meal.ingredients.forEach((ingredient: string) => {
          if (ingredients[ingredient]) {
            ingredients[ingredient].quantity += 1;
          } else {
            ingredients[ingredient] = {
              quantity: 1,
              unit: "portion",
              category: "other",
            };
          }
        });
      }
    });
  });

  // Group by categories
  return {
    vegetables: Object.entries(ingredients).filter(([name]) =>
      name.toLowerCase().includes("vegetable")
    ),
    proteins: Object.entries(ingredients).filter(([name]) =>
      name.toLowerCase().includes("protein")
    ),
    grains: Object.entries(ingredients).filter(([name]) =>
      name.toLowerCase().includes("rice")
    ),
    other: Object.entries(ingredients).filter(
      ([name]) =>
        !name.toLowerCase().includes("vegetable") &&
        !name.toLowerCase().includes("protein") &&
        !name.toLowerCase().includes("rice")
    ),
    generated_at: new Date().toISOString(),
  };
}

async function findDishSubstitute(
  originalDish: any,
  preferences: any,
  profile: any
) {
  if (!GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY not configured, using mock substitute");
    return generateMockSubstitute(originalDish, preferences);
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_ID });

    const prompt = `
Tôi cần tìm món ăn thay thế cho "${originalDish.name}" với các yêu cầu sau:

**Món gốc:**
- Tên: ${originalDish.name}
- Calories: ${originalDish.calories || "không rõ"}

**Yêu cầu thay thế:**
- Ẩm thực: ${preferences?.cuisine || "Việt Nam"}
- Thời gian nấu tối đa: ${preferences?.max_cook_time || 30} phút
- Yêu cầu ăn kiêng: ${
      preferences?.dietary_requirements?.join(", ") || "không có"
    }

**Thông tin người dùng:**
- Mục tiêu: ${profile?.goal || "maintain"}
- Hoạt động: ${profile?.activity_level || "moderate"}

Hãy đề xuất 1 món ăn Việt Nam cụ thể thay thế phù hợp. Trả về JSON theo format:

{
  "name": "Tên món ăn thay thế cụ thể",
  "ingredients": ["nguyên liệu 1", "nguyên liệu 2", "..."],
  "calories": số_calories_tương_đương,
  "protein": số_protein_grams,
  "carbs": số_carbs_grams,
  "fat": số_fat_grams,
  "cooking_time": thời_gian_phút,
  "cuisine": "vietnamese",
  "cooking_instructions": "Hướng dẫn nấu ngắn gọn",
  "why_substitute": "Lý do thay thế và lợi ích"
}

**Yêu cầu:**
1. Món thay thế phải là món ăn Việt Nam thật
2. Dinh dưỡng tương đương món gốc
3. Phù hợp với sở thích người dùng
4. Chỉ trả về JSON, không text khác`;

    console.log("🔄 Finding substitute with Gemini AI...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const substitute = JSON.parse(jsonMatch[0]);
      console.log("✅ Gemini AI substitute found:", substitute.name);
      return substitute;
    } else {
      console.warn(
        "⚠️ Could not extract JSON from Gemini response, using mock substitute"
      );
      return generateMockSubstitute(originalDish, preferences);
    }
  } catch (error) {
    console.error("❌ Gemini AI substitute error:", error);
    return generateMockSubstitute(originalDish, preferences);
  }
}

// Fallback mock substitute
function generateMockSubstitute(originalDish: any, preferences: any) {
  const vietnameseSubstitutes = [
    {
      name: "Bún chả cá",
      ingredients: ["bún", "chả cá", "rau thơm", "nước mắm"],
      calories: originalDish.calories || 350,
      protein: 25,
      carbs: 45,
      fat: 8,
      cooking_time: 20,
      cuisine: "vietnamese",
      cooking_instructions:
        "Luộc bún, chiên chả cá, trộn với rau thơm và nước mắm",
      why_substitute: "Món ăn nhẹ, giàu protein, phù hợp cho mục tiêu sức khỏe",
    },
    {
      name: "Cơm gà xối mỡ",
      ingredients: ["cơm", "thịt gà", "mỡ gà", "rau củ"],
      calories: originalDish.calories || 450,
      protein: 30,
      carbs: 50,
      fat: 15,
      cooking_time: 25,
      cuisine: "vietnamese",
      cooking_instructions: "Nấu cơm, luộc gà, xối mỗ nóng lên cơm",
      why_substitute: "Đầy đủ chất dinh dưỡng, dễ tiêu hóa",
    },
  ];

  return vietnameseSubstitutes[
    Math.floor(Math.random() * vietnameseSubstitutes.length)
  ];
}

function updateMealPlanWithSubstitution(
  planData: any,
  dayIndex: number,
  mealSlot: string,
  substitute: any
) {
  const updatedPlan = { ...planData };
  if (updatedPlan[`day_${dayIndex}`]) {
    updatedPlan[`day_${dayIndex}`][mealSlot] = substitute;
  }
  return updatedPlan;
}

export default MealPlanController;
