import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";

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

      res.json({ meal: result });
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
}
