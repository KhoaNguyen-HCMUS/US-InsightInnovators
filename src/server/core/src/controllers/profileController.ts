import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { serializeProfile } from "../utils/serialization";

const prisma = require("../../prisma/client");

const toNum = (d?: Prisma.Decimal | number | null, def = 0) =>
  d == null ? def : Number(d);

// Helper function to safely serialize objects with BigInt
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === "object") {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized;
  }

  return obj;
}

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
  height: z.number().min(100).max(250).optional(),
  height_cm: z.number().min(100).max(250).optional(),
  weight: z.number().min(25).max(300).optional(),
  weight_kg: z.number().min(25).max(300).optional(),
  gender: z.enum(["male", "female"]).optional(),
  sex: z.enum(["male", "female"]).optional(),
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
  preferences_json: z.any().optional(), // Accept both object and array
});

const PutProfileBody = ProfileInput.extend({
  age: z.number().min(10).max(100),
});

const PostProfileBody = z.object({
  age: z.number().min(10).max(100),
  height: z.number().min(100).max(250).optional(),
  height_cm: z.number().min(100).max(250).optional(),
  weight: z.number().min(30).max(300).optional(),
  weight_kg: z.number().min(30).max(300).optional(),
  gender: z.enum(["male", "female"]).optional(),
  sex: z.enum(["male", "female"]).optional(),
  activity_level: z.enum([
    "sedentary",
    "light",
    "moderate",
    "active",
    "very_active",
  ]),
  goal: z.enum(["lose", "maintain", "gain"]),
  conditions_json: z.any().optional(), // Accept any format
  allergies_json: z.any().optional(), // Accept any format
  preferences_json: z.any().optional(), // Accept any format
});

export class ProfileController {
  // GET /profile
  static async getProfile(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const profile = await prisma.profiles
        .findUnique({ where: { user_id } })
        .catch(() => null);

      if (profile) {
        // Use serializeProfile helper for proper BigInt handling
        const serializedProfile = serializeProfile(profile);
        res.json(serializedProfile);
      } else {
        res.json(null);
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // POST /profile - Tạo profile mới
  static async createProfile(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;

      // Kiểm tra xem user đã có profile chưa
      const existingProfile = await prisma.profiles.findUnique({
        where: { user_id },
      });
      if (existingProfile) {
        const serializedExisting = serializeBigInt(existingProfile);
        return res.status(409).json({
          error: "Profile already exists. Use PUT to update.",
          existing_profile: serializedExisting,
        });
      }

      const p = PostProfileBody.safeParse(req.body);
      if (!p.success) return res.status(400).json({ error: p.error.flatten() });

      // Normalize field names (support both formats)
      const height_cm = p.data.height_cm || p.data.height;
      const weight_kg = p.data.weight_kg || p.data.weight;
      const sex = p.data.sex || p.data.gender;

      // Validate required fields
      if (!height_cm || !weight_kg || !sex) {
        return res.status(400).json({
          error: "Missing required fields",
          message:
            "height (or height_cm), weight (or weight_kg), and gender (or sex) are required",
        });
      }

      const { activity_level, goal, age } = p.data;
      const bmi = calcBMI(height_cm, weight_kg);
      const bmr = calcBMR(sex, age, height_cm, weight_kg);
      const tdee = Math.round(bmr * palFromActivity(activity_level));

      const profile = await prisma.profiles.create({
        data: {
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

      console.log("Profile created:", profile);
      console.log("Profile type:", typeof profile);
      console.log(
        "Profile.user_id:",
        profile?.user_id,
        "type:",
        typeof profile?.user_id
      );
      console.log("Profile fields:", Object.keys(profile || {}));

      if (!profile) {
        return res.status(500).json({ error: "Failed to create profile" });
      }

      // Convert BigInt to string for JSON serialization
      const serializedProfile = serializeProfile(profile);

      res.status(201).json({
        message: "Profile created successfully",
        profile: serializedProfile,
        calculated_indices: { bmi, bmr, tdee },
      });
    } catch (error) {
      console.error("Create profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // PUT /profile
  static async updateProfile(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const p = PutProfileBody.safeParse(req.body);
      if (!p.success) return res.status(400).json({ error: p.error.flatten() });

      // Normalize field names (support both formats)
      const height_cm = p.data.height_cm || p.data.height;
      const weight_kg = p.data.weight_kg || p.data.weight;
      const sex = p.data.sex || p.data.gender;

      // Validate required fields
      if (!height_cm || !weight_kg || !sex) {
        return res.status(400).json({
          error: "Missing required fields",
          message:
            "height (or height_cm), weight (or weight_kg), and gender (or sex) are required",
        });
      }

      const { activity_level, goal } = p.data;
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

      // Convert BigInt to string for JSON serialization
      const serializedSaved = serializeBigInt(saved);

      res.json({ profile: serializedSaved, indices: { bmi, bmr, tdee } });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /profile/insights - Phân tích thông minh về sức khỏe
  static async getProfileInsights(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const profile = await prisma.profiles.findUnique({ where: { user_id } });

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Helper functions for health analysis
      const getBMICategory = (bmi: number) => {
        if (bmi < 18.5)
          return {
            category: "underweight",
            message: "Bạn đang thiếu cân, cần tăng cường dinh dưỡng",
          };
        if (bmi < 25)
          return {
            category: "normal",
            message: "BMI bình thường, hãy duy trì lối sống lành mạnh",
          };
        if (bmi < 30)
          return {
            category: "overweight",
            message: "Bạn đang thừa cân, nên giảm 5-10% trọng lượng",
          };
        return {
          category: "obese",
          message: "Cần giảm cân nghiêm túc, hãy tham khảo chuyên gia",
        };
      };

      const getCalorieTarget = (goal: string, tdee: number) => {
        switch (goal) {
          case "lose":
            return Math.round(tdee * 0.8); // Deficit 20%
          case "gain":
            return Math.round(tdee * 1.15); // Surplus 15%
          default:
            return tdee;
        }
      };

      const getMacroTargets = (calories: number, goal: string) => {
        if (goal === "gain") {
          return {
            protein: Math.round((calories * 0.25) / 4), // 25% protein
            carbs: Math.round((calories * 0.45) / 4), // 45% carbs
            fat: Math.round((calories * 0.3) / 9), // 30% fat
          };
        } else if (goal === "lose") {
          return {
            protein: Math.round((calories * 0.3) / 4), // 30% protein
            carbs: Math.round((calories * 0.4) / 4), // 40% carbs
            fat: Math.round((calories * 0.3) / 9), // 30% fat
          };
        } else {
          return {
            protein: Math.round((calories * 0.2) / 4), // 20% protein
            carbs: Math.round((calories * 0.5) / 4), // 50% carbs
            fat: Math.round((calories * 0.3) / 9), // 30% fat
          };
        }
      };

      const bmi = Number(profile.bmi);
      const tdee = Number(profile.tdee);
      const bmiAnalysis = getBMICategory(bmi);
      const targetCalories = getCalorieTarget(profile.goal, tdee);
      const macroTargets = getMacroTargets(targetCalories, profile.goal);

      const insights = {
        health_status: {
          bmi: { value: bmi, ...bmiAnalysis },
          weight_status:
            profile.goal === "lose"
              ? "Đang giảm cân"
              : profile.goal === "gain"
              ? "Đang tăng cân"
              : "Duy trì cân nặng",
        },
        targets: {
          daily_calories: targetCalories,
          macros: macroTargets,
          water_ml: Math.round(Number(profile.weight_kg) * 35), // 35ml/kg
        },
        recommendations: [
          bmiAnalysis.message,
          `Mục tiêu ${targetCalories} calories/ngày để ${
            profile.goal === "lose"
              ? "giảm cân"
              : profile.goal === "gain"
              ? "tăng cân"
              : "duy trì"
          }`,
          `Uống ${Math.round(Number(profile.weight_kg) * 35)}ml nước mỗi ngày`,
        ],
      };

      // Convert BigInt to string for JSON serialization
      const serializedProfileSummary = serializeBigInt(profile);

      res.json({ insights, profile_summary: serializedProfileSummary });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /profile/constraints - Các ràng buộc sức khỏe và sở thích
  static async getHealthConstraints(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const profile = await prisma.profiles.findUnique({ where: { user_id } });

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const allergies = profile.allergies_json
        ? (profile.allergies_json as string[])
        : [];
      const conditions = profile.conditions_json
        ? (profile.conditions_json as string[])
        : [];
      const preferences = profile.preferences_json
        ? (profile.preferences_json as string[])
        : [];

      // Parse health constraints
      const healthConstraints = {
        allergies: {
          items: allergies,
          restrictions: allergies.map(
            (allergy: string) => `Tránh hoàn toàn ${allergy}`
          ),
        },
        medical_conditions: {
          items: conditions,
          guidelines: conditions.map((condition: string) => {
            switch (condition.toLowerCase()) {
              case "diabetes":
                return "Hạn chế đường, ưu tiên complex carbs";
              case "hypertension":
                return "Giảm muối <2g/ngày, tăng kali";
              case "high_cholesterol":
                return "Tránh trans fat, tăng omega-3";
              default:
                return `Điều chỉnh chế độ ăn phù hợp với ${condition}`;
            }
          }),
        },
        dietary_preferences: {
          items: preferences,
          focus: preferences.map((pref: string) => {
            switch (pref.toLowerCase()) {
              case "vegetarian":
                return "Ưu tiên protein thực vật";
              case "keto":
                return "Cao fat, thấp carb <20g/ngày";
              case "mediterranean":
                return "Dầu olive, cá, rau củ";
              case "low_carb":
                return "Giảm carb <100g/ngày";
              default:
                return `Tuân theo chế độ ${pref}`;
            }
          }),
        },
      };

      res.json({
        constraints: healthConstraints,
        profile_id: profile.user_id.toString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
