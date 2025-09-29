import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { serializeBigIntObject } from "../utils/serialization";

const prisma = require("../../prisma/client");

const toNum = (d?: Prisma.Decimal | number | null, def = 0) =>
  d == null ? def : Number(d);

const LogMealBody = z.object({
  date_time: z.string().datetime(),
  type: z.string().optional(),
  meal_slot: z.string().optional(),
  items: z
    .array(
      z.object({
        food_id: z.string().or(z.number()),
        qty_grams: z.number().min(1).max(5000),
      })
    )
    .min(1),
});

export class MealController {
  // POST /meals
  static async createMeal(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const parse = LogMealBody.safeParse(req.body);
      if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });

      const body = parse.data;
      const dt = new Date(body.date_time);

      // lấy info foods để tính snapshot
      const foodIds = body.items.map((i) => BigInt(i.food_id as any));
      const foods = await prisma.foods.findMany({
        where: { id: { in: foodIds } },
      });
      const foodMap = new Map(foods.map((f: any) => [f.id.toString(), f]));

      // tạo meal
      const meal = await prisma.meals.create({
        data: {
          user_id,
          date_time: dt,
          type: body.type ?? null,
          meal_slot: body.meal_slot ?? null,
          source: "user",
        },
      });

      // tạo meal_items + logs + update summary
      for (const [idx, it] of body.items.entries()) {
        const food_id = BigInt(it.food_id as any);
        const f = foodMap.get(food_id.toString());
        if (!f) {
          console.warn(`Food with ID ${food_id} not found`);
          continue;
        }

        // nutrition per qty (từ *_100g) - với type safety
        const ratio = it.qty_grams / 100.0;
        const kcal = toNum((f as any).kcal_100g || 0) * ratio;
        const p = toNum((f as any).protein_100g || 0) * ratio;
        const c = toNum((f as any).carbs_100g || 0) * ratio;
        const fat = toNum((f as any).fat_100g || 0) * ratio;

        // meal_items
        await prisma.meal_items.create({
          data: {
            meal_id: meal.id,
            food_id,
            qty_grams: new Prisma.Decimal(it.qty_grams),
            idx,
          },
        });

        // user_food_logs (snapshot)
        await prisma.user_food_logs.create({
          data: {
            user_id,
            meal_id: meal.id,
            food_id,
            qty_grams: new Prisma.Decimal(it.qty_grams),
            kcal_snapshot: new Prisma.Decimal(kcal),
            protein_snapshot: new Prisma.Decimal(p),
            carbs_snapshot: new Prisma.Decimal(c),
            fat_snapshot: new Prisma.Decimal(fat),
          },
        });

        // user_food_summary (upsert + accumulate)
        const prev = await prisma.user_food_summary.findFirst({
          where: { user_id, food_id },
        });

        if (!prev) {
          await prisma.user_food_summary.create({
            data: {
              user_id,
              food_id,
              times_eaten: 1,
              total_grams: new Prisma.Decimal(it.qty_grams),
              avg_portion_grams: new Prisma.Decimal(it.qty_grams),
              first_eaten_at: dt,
              last_eaten_at: dt,
              last_meal_id: meal.id,
            },
          });
        } else {
          const total_grams = toNum(prev.total_grams) + it.qty_grams;
          const times = (prev.times_eaten ?? 0) + 1;
          const avg = total_grams / times;
          await prisma.user_food_summary.update({
            where: { id: prev.id },
            data: {
              times_eaten: times,
              total_grams: new Prisma.Decimal(total_grams),
              avg_portion_grams: new Prisma.Decimal(avg),
              last_eaten_at: dt,
              last_meal_id: meal.id,
              updated_at: new Date(),
            },
          });
        }
      }

      // trả về meal + items
      const result = await prisma.meals.findUnique({
        where: { id: meal.id },
        include: { meal_items: true },
      });

      // Serialize BigInt fields
      const serializedResult = serializeBigIntObject(result);
      res.json({ meal: serializedResult });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /progress/today
  static async getTodayProgress(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const logs = await prisma.user_food_logs.findMany({
        where: { user_id, created_at: { gte: start, lte: end } },
      });

      const totals = logs.reduce(
        (acc: any, l: any) => {
          acc.kcal += toNum(l.kcal_snapshot);
          acc.protein += toNum(l.protein_snapshot);
          acc.carbs += toNum(l.carbs_snapshot);
          acc.fat += toNum(l.fat_snapshot);
          return acc;
        },
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      );

      // Lấy TDEE nếu có để FE so sánh
      const profile = await prisma.profiles.findUnique({ where: { user_id } });
      const tdee = toNum(profile?.tdee);

      res.json({ totals, tdee });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /meals/analytics - Phân tích thói quen ăn uống
  static async getMealAnalytics(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const days = parseInt(req.query.days as string) || 7;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const meals = await prisma.meals.findMany({
        where: { user_id, date_time: { gte: startDate } },
        include: { meal_items: true },
      });

      const logs = await prisma.user_food_logs.findMany({
        where: { user_id, created_at: { gte: startDate } },
      });

      // Phân tích theo ngày
      const dailyStats = logs.reduce((acc: any, log: any) => {
        const day = log.created_at.toISOString().split("T")[0];
        if (!acc[day])
          acc[day] = { kcal: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
        acc[day].kcal += toNum(log.kcal_snapshot);
        acc[day].protein += toNum(log.protein_snapshot);
        acc[day].carbs += toNum(log.carbs_snapshot);
        acc[day].fat += toNum(log.fat_snapshot);
        return acc;
      }, {});

      // Đếm bữa ăn theo ngày
      meals.forEach((meal: any) => {
        const day = meal.date_time.toISOString().split("T")[0];
        if (dailyStats[day]) dailyStats[day].meals++;
      });

      // Tính averages
      const totalDays = Object.keys(dailyStats).length || 1;
      const avgDaily = {
        kcal:
          Object.values(dailyStats).reduce(
            (sum: number, day: any) => sum + day.kcal,
            0
          ) / totalDays,
        protein:
          Object.values(dailyStats).reduce(
            (sum: number, day: any) => sum + day.protein,
            0
          ) / totalDays,
        carbs:
          Object.values(dailyStats).reduce(
            (sum: number, day: any) => sum + day.carbs,
            0
          ) / totalDays,
        fat:
          Object.values(dailyStats).reduce(
            (sum: number, day: any) => sum + day.fat,
            0
          ) / totalDays,
        meals_per_day:
          Object.values(dailyStats).reduce(
            (sum: number, day: any) => sum + day.meals,
            0
          ) / totalDays,
      };

      // Pattern analysis
      const patterns = {
        consistency: avgDaily.meals_per_day >= 3 ? "Đều đặn" : "Không đều",
        calorie_trend:
          avgDaily.kcal > 2200
            ? "Cao"
            : avgDaily.kcal < 1500
            ? "Thấp"
            : "Bình thường",
        protein_adequate: avgDaily.protein >= 50 ? "Đủ" : "Thiếu",
      };

      // Serialize BigInt fields
      const serializedAnalytics = serializeBigIntObject({
        analytics: { daily_stats: dailyStats, averages: avgDaily, patterns },
        period: { days, start: startDate, total_meals: meals.length },
      });

      res.json(serializedAnalytics);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /meals/suggestions - Gợi ý bữa ăn thông minh
  static async getMealSuggestions(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const meal_type = (req.query.type as string) || "any"; // breakfast, lunch, dinner, snack

      // Lấy profile để hiểu constraints
      const profile = await prisma.profiles.findUnique({ where: { user_id } });
      if (!profile) return res.status(404).json({ error: "Profile not found" });

      // Lấy tiến trình hôm nay
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayLogs = await prisma.user_food_logs.findMany({
        where: { user_id, created_at: { gte: today } },
      });

      const consumed = todayLogs.reduce(
        (acc: any, log: any) => {
          acc.kcal += toNum(log.kcal_snapshot);
          acc.protein += toNum(log.protein_snapshot);
          acc.carbs += toNum(log.carbs_snapshot);
          acc.fat += toNum(log.fat_snapshot);
          return acc;
        },
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const tdee = toNum(profile.tdee);
      const remaining = {
        kcal: Math.max(0, tdee - consumed.kcal),
        protein: Math.max(0, (tdee * 0.2) / 4 - consumed.protein), // 20% protein target
        carbs: Math.max(0, (tdee * 0.5) / 4 - consumed.carbs), // 50% carbs target
        fat: Math.max(0, (tdee * 0.3) / 9 - consumed.fat), // 30% fat target
      };

      // Lấy allergies để filter
      const allergies = profile.allergies_json
        ? (profile.allergies_json as string[])
        : [];

      // Simple food suggestions (trong thực tế sẽ query database)
      const suggestions = [
        {
          meal_type: "breakfast",
          name: "Yến mạch với trái cây",
          kcal: 300,
          protein: 12,
          carbs: 55,
          fat: 6,
          suitable_for: remaining.kcal >= 250,
          reason: "Nhiều chất xơ, protein từ yến mạch",
        },
        {
          meal_type: "lunch",
          name: "Cơm gà nướng với rau",
          kcal: 450,
          protein: 35,
          carbs: 45,
          fat: 12,
          suitable_for: remaining.kcal >= 400,
          reason: "Cân bằng macro, protein cao",
        },
        {
          meal_type: "dinner",
          name: "Cá hồi với quinoa",
          kcal: 380,
          protein: 28,
          carbs: 35,
          fat: 15,
          suitable_for: remaining.kcal >= 350,
          reason: "Omega-3, protein chất lượng cao",
        },
        {
          meal_type: "snack",
          name: "Hạnh nhân và táo",
          kcal: 180,
          protein: 6,
          carbs: 20,
          fat: 9,
          suitable_for: remaining.kcal >= 150,
          reason: "Healthy fats, vitamin",
        },
      ]
        .filter((s) => meal_type === "any" || s.meal_type === meal_type)
        .filter((s) => s.suitable_for)
        .slice(0, 5);

      // Serialize BigInt fields
      const serializedResponse = serializeBigIntObject({
        suggestions,
        context: {
          consumed_today: consumed,
          remaining_targets: remaining,
          progress_percent: Math.round((consumed.kcal / tdee) * 100),
        },
      });

      res.json(serializedResponse);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /meals/patterns - Phân tích pattern ăn uống
  static async getEatingPatterns(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const days = parseInt(req.query.days as string) || 14;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const meals = await prisma.meals.findMany({
        where: { user_id, date_time: { gte: startDate } },
        orderBy: { date_time: "asc" },
      });

      // Phân tích theo giờ trong ngày
      const hourlyPattern = meals.reduce((acc: any, meal: any) => {
        const hour = meal.date_time.getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});

      // Xác định meal timing patterns
      const mealTimes = {
        breakfast: Object.keys(hourlyPattern).filter(
          (h) => parseInt(h) >= 6 && parseInt(h) <= 10
        ).length,
        lunch: Object.keys(hourlyPattern).filter(
          (h) => parseInt(h) >= 11 && parseInt(h) <= 14
        ).length,
        dinner: Object.keys(hourlyPattern).filter(
          (h) => parseInt(h) >= 17 && parseInt(h) <= 21
        ).length,
        late_snack: Object.keys(hourlyPattern).filter(
          (h) => parseInt(h) >= 22 || parseInt(h) <= 5
        ).length,
      };

      // Phân tích weekly patterns
      const weeklyPattern = meals.reduce((acc: any, meal: any) => {
        const day = meal.date_time.getDay(); // 0=Sunday, 1=Monday...
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      // Insights
      const insights = {
        regular_breakfast: mealTimes.breakfast >= days * 0.7,
        regular_lunch: mealTimes.lunch >= days * 0.7,
        regular_dinner: mealTimes.dinner >= days * 0.7,
        late_eating: mealTimes.late_snack > days * 0.3,
        weekend_consistent:
          (weeklyPattern[0] + weeklyPattern[6]) / 2 >=
          ((Object.values(weeklyPattern).reduce(
            (a: number, b: any) => a + b,
            0
          ) -
            weeklyPattern[0] -
            weeklyPattern[6]) /
            5) *
            0.8,
      };

      const recommendations = [];
      if (!insights.regular_breakfast)
        recommendations.push("Hãy cố gắng ăn sáng đều đặn hơn (6-10h)");
      if (insights.late_eating)
        recommendations.push("Tránh ăn khuya sau 22h để cải thiện tiêu hóa");
      if (!insights.weekend_consistent)
        recommendations.push(
          "Duy trì thói quen ăn uống nhất quán cả cuối tuần"
        );

      // Serialize BigInt fields
      const serializedResponse = serializeBigIntObject({
        patterns: {
          hourly: hourlyPattern,
          weekly: weeklyPattern,
          meal_times: mealTimes,
        },
        insights,
        recommendations,
        period: { days, total_meals: meals.length },
      });

      res.json(serializedResponse);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
