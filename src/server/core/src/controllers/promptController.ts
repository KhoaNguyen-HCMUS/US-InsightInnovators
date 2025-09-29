import { Request, Response } from "express";
import { z } from "zod";
import { serializeBigIntObject } from "../utils/serialization";

const prisma = require("../../prisma/client");

const PromptBody = z.object({
  prompt_text: z.string(),
  response_text: z.string().optional(),
  purpose: z.string().optional(),
});

const OptimizePromptBody = z.object({
  user_message: z.string().max(1000),
  context_type: z
    .enum(["nutrition", "fitness", "health", "general"])
    .optional(),
  include_profile: z.boolean().optional(),
});

export class PromptController {
  // POST /prompts
  static async createPrompt(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const p = PromptBody.safeParse(req.body);
      if (!p.success) return res.status(400).json({ error: p.error.flatten() });

      const saved = await prisma.prompts.create({
        data: {
          user_id,
          prompt_text: p.data.prompt_text,
          response_text: p.data.response_text ?? null,
          purpose: p.data.purpose ?? null,
        },
      });

      // Serialize BigInt fields
      const serializedSaved = serializeBigIntObject(saved);
      res.json({ id: serializedSaved.id });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /prompts - Lấy prompt history của user
  static async getUserPrompts(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
      const purpose = req.query.purpose as string;

      const where: any = { user_id };
      if (purpose) where.purpose = purpose;

      const prompts = await prisma.prompts.findMany({
        where,
        orderBy: { created_at: "desc" },
        take: limit,
        select: {
          id: true,
          prompt_text: true,
          response_text: true,
          purpose: true,
          created_at: true,
        },
      });

      // Serialize BigInt fields
      const serializedPrompts = serializeBigIntObject(prompts);
      res.json({ prompts: serializedPrompts, total: prompts.length });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // POST /prompts/optimize - Tối ưu prompt cho AI response tốt hơn
  static async optimizePrompt(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const p = OptimizePromptBody.safeParse(req.body);
      if (!p.success) return res.status(400).json({ error: p.error.flatten() });

      const { user_message, context_type, include_profile } = p.data;

      // Lấy profile nếu cần
      let profileContext = "";
      if (include_profile !== false) {
        const profile = await prisma.profiles.findUnique({
          where: { user_id },
        });
        if (profile) {
          const bmi = Number(profile.bmi || 0);
          const bmiCategory =
            bmi < 18.5
              ? "thiếu cân"
              : bmi < 25
              ? "bình thường"
              : bmi < 30
              ? "thừa cân"
              : "béo phì";

          profileContext = `
🔍 Context người dùng:
- Thể chất: ${profile.sex}, ${profile.height_cm}cm, ${profile.weight_kg}kg, BMI ${bmi} (${bmiCategory})
- Mục tiêu: ${profile.goal} | Hoạt động: ${profile.activity_level} | TDEE: ${profile.tdee} kcal/ngày`;

          // Parse constraints
          const allergies = profile.allergies_json
            ? (profile.allergies_json as string[])
            : [];
          const conditions = profile.conditions_json
            ? (profile.conditions_json as string[])
            : [];

          if (allergies.length > 0)
            profileContext += `\n- Dị ứng: ${allergies.join(", ")}`;
          if (conditions.length > 0)
            profileContext += `\n- Tình trạng: ${conditions.join(", ")}`;
        }
      }

      // Context-specific prompt optimization
      const contextPrompts = {
        nutrition: [
          "🥗 Trả lời về dinh dưỡng với số liệu cụ thể (kcal, protein, carbs, fat)",
          "🚫 Luôn kiểm tra allergies và medical conditions trước khi gợi ý",
          "🎯 Align với mục tiêu user (lose/gain/maintain weight)",
          "📊 Suggest portion sizes và meal timing phù hợp",
        ],
        fitness: [
          "💪 Đưa workout suggestions dựa trên activity level",
          "⏱️ Include duration, intensity và frequency cụ thể",
          "🔥 Estimate calories burned cho mỗi exercise",
          "🎯 Align với fitness goals và current fitness level",
        ],
        health: [
          "🏥 Provide evidence-based health information",
          "⚠️ Disclaimer: không thay thế medical advice",
          "🔍 Focus on prevention và healthy lifestyle",
          "📋 Consider existing medical conditions",
        ],
        general: [
          "💡 Trả lời helpful và informative",
          "🎯 Cá nhân hóa response dựa trên user context",
          "📊 Include relevant data points khi có thể",
          "🌟 Encourage healthy habits và positive mindset",
        ],
      };

      const selectedContext = context_type || "general";
      const contextRules = contextPrompts[selectedContext];

      const optimizedPrompt = `
${contextRules.join("\n")}

${profileContext}

❓ User question: "${user_message}"

🎯 Hãy trả lời với:
- Thông tin chính xác và cụ thể
- Số liệu rõ ràng khi phù hợp  
- Tôn trọng health constraints của user
- Tone tự nhiên, friendly nhưng professional
- Actionable advice user có thể apply ngay`;

      // Lưu optimized prompt để tracking
      const saved = await prisma.prompts.create({
        data: {
          user_id,
          prompt_text: optimizedPrompt,
          purpose: `optimized_${selectedContext}`,
        },
      });

      // Serialize BigInt fields
      const serializedSaved = serializeBigIntObject(saved);
      res.json({
        optimized_prompt: optimizedPrompt,
        original_message: user_message,
        context_applied: selectedContext,
        has_profile_context: !!profileContext,
        prompt_id: serializedSaved.id,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /prompts/templates - Cung cấp prompt templates cho different use cases
  static async getPromptTemplates(req: Request, res: Response) {
    try {
      const category = (req.query.category as string) || "all";

      const templates = {
        nutrition: [
          {
            name: "Meal Planning",
            template:
              "Gợi ý thực đơn {meal_type} cho mục tiêu {goal} với {calories} kcal, tránh {allergies}",
            variables: ["meal_type", "goal", "calories", "allergies"],
            example:
              "Gợi ý thực đơn breakfast cho mục tiêu lose với 400 kcal, tránh nuts",
          },
          {
            name: "Macro Analysis",
            template:
              "Phân tích macro của món {food_name} và đánh giá phù hợp cho {goal}",
            variables: ["food_name", "goal"],
            example:
              "Phân tích macro của món cơm gà và đánh giá phù hợp cho lose weight",
          },
          {
            name: "Progress Review",
            template:
              "Review tiến trình {days} ngày qua: đã ăn {avg_calories} kcal/ngày, mục tiêu {target_calories}",
            variables: ["days", "avg_calories", "target_calories"],
            example:
              "Review tiến trình 7 ngày qua: đã ăn 1800 kcal/ngày, mục tiêu 1600",
          },
        ],
        fitness: [
          {
            name: "Workout Planning",
            template:
              "Thiết kế workout {duration} phút cho {goal} với equipment {equipment}",
            variables: ["duration", "goal", "equipment"],
            example:
              "Thiết kế workout 30 phút cho weight loss với equipment dumbbells",
          },
          {
            name: "Exercise Analysis",
            template:
              "Phân tích exercise {exercise_name}: calories burned, muscle groups, difficulty level",
            variables: ["exercise_name"],
            example:
              "Phân tích exercise burpees: calories burned, muscle groups, difficulty level",
          },
        ],
        health: [
          {
            name: "Symptom Assessment",
            template:
              "Đánh giá symptoms {symptoms} và gợi ý lifestyle adjustments",
            variables: ["symptoms"],
            example:
              "Đánh giá symptoms mệt mỏi, khó ngủ và gợi ý lifestyle adjustments",
          },
          {
            name: "Habit Formation",
            template:
              "Hướng dẫn xây dựng habit {habit_name} trong {timeframe} với {current_level}",
            variables: ["habit_name", "timeframe", "current_level"],
            example:
              "Hướng dẫn xây dựng habit drink more water trong 21 ngày với beginner level",
          },
        ],
      };

      const result =
        category === "all"
          ? templates
          : { [category]: templates[category as keyof typeof templates] || [] };

      res.json({
        templates: result,
        categories: Object.keys(templates),
        usage:
          "Sử dụng {variable} trong template và replace với giá trị thực tế",
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /healthz
  static async healthCheck(req: Request, res: Response) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true, timestamp: new Date().toISOString() });
    } catch (e) {
      res.status(500).json({ ok: false, error: "Database connection failed" });
    }
  }
}
