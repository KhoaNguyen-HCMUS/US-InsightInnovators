import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const prisma = require("../../prisma/client");

const toNum = (d?: Prisma.Decimal | number | null, def = 0) =>
  d == null ? def : Number(d);

// Nutrition formulas
function palFromActivity(level: string) {
  switch (level) {
    case "sedentary":
      return 1.2;
    case "light":
      return 1.375;
    case "moderate":
      return 1.55;
    case "active":
      return 1.725;
    case "very_active":
      return 1.9;
    default:
      return 1.2;
  }
}

function calcBMI(height_cm: number, weight_kg: number) {
  const m = height_cm / 100;
  return +(weight_kg / (m * m)).toFixed(2);
}

function calcBMR(
  sex: "male" | "female",
  age: number,
  height_cm: number,
  weight_kg: number
) {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

// Schemas
const ProfileInput = z.object({
  height_cm: z.number().min(100).max(250),
  weight_kg: z.number().min(25).max(300),
  sex: z.enum(["male", "female"]),
  activity_level: z.enum([
    "sedentary",
    "light",
    "moderate",
    "active",
    "very_active",
  ]),
  goal: z.enum(["lose", "maintain", "gain"]),
  conditions_json: z.any().optional(),
  allergies_json: z.any().optional(),
  preferences_json: z.any().optional(),
});

const PutProfileBody = ProfileInput.extend({
  age: z.number().min(10).max(100),
});

export class ProfileController {
  // GET /profile
  static async getProfile(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const profile = await prisma.profiles
        .findUnique({ where: { user_id } })
        .catch(() => null);
      res.json(profile ?? null);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // PUT /profile
  static async updateProfile(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const p = PutProfileBody.safeParse(req.body);
      if (!p.success) return res.status(400).json({ error: p.error.flatten() });

      const { height_cm, weight_kg, sex, activity_level, goal } = p.data;
      const bmi = calcBMI(height_cm, weight_kg);
      const bmr = calcBMR(sex, p.data.age, height_cm, weight_kg);
      const tdee = Math.round(bmr * palFromActivity(activity_level));

      const saved = await prisma.profiles.upsert({
        where: { user_id },
        update: {
          height_cm: new Prisma.Decimal(height_cm),
          weight_kg: new Prisma.Decimal(weight_kg),
          sex,
          activity_level,
          goal,
          conditions_json: p.data.conditions_json ?? Prisma.JsonNull,
          allergies_json: p.data.allergies_json ?? Prisma.JsonNull,
          preferences_json: p.data.preferences_json ?? Prisma.JsonNull,
          bmi: new Prisma.Decimal(bmi),
          bmr: new Prisma.Decimal(bmr),
          tdee: new Prisma.Decimal(tdee),
          updated_at: new Date(),
        },
        create: {
          user_id,
          height_cm: new Prisma.Decimal(height_cm),
          weight_kg: new Prisma.Decimal(weight_kg),
          sex,
          activity_level,
          goal,
          conditions_json: p.data.conditions_json ?? Prisma.JsonNull,
          allergies_json: p.data.allergies_json ?? Prisma.JsonNull,
          preferences_json: p.data.preferences_json ?? Prisma.JsonNull,
          bmi: new Prisma.Decimal(bmi),
          bmr: new Prisma.Decimal(bmr),
          tdee: new Prisma.Decimal(tdee),
        },
      });

      res.json({ profile: saved, indices: { bmi, bmr, tdee } });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
