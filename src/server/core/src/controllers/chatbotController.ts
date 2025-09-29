import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Prisma Client
const prisma = require("../../prisma/client");

// ====== LLM (Gemini) wiring ======
import { GoogleGenerativeAI } from "@google/generative-ai";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL_ID = process.env.GEMINI_MODEL_ID || "gemini-2.5-flash";

// Zod schemas
const ChatMsgBody = z.object({
  session_id: z.string().or(z.number()),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(4000),
  top_passages: z.any().optional(),
  meta: z.any().optional(),
});

// (tuỳ chọn) giới hạn số message làm ngữ cảnh
const HISTORY_TAKE = 20;

async function getProfileContext(user_id: bigint) {
  const p = await prisma.profiles
    .findUnique({ where: { user_id } })
    .catch(() => null);
  if (!p) return undefined;

  const toNum = (d?: Prisma.Decimal | number | null) =>
    d == null ? undefined : Number(d);

  // 🚀 ENHANCED: Lấy eating patterns gần đây (7 ngày)
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 7);

  const recentMeals = await prisma.meals.findMany({
    where: { user_id, created_at: { gte: recentDate } },
    orderBy: { created_at: "desc" },
    take: 10,
  });

  // 🚀 ENHANCED: Lấy progress hôm nay
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLogs = await prisma.user_food_logs.findMany({
    where: { user_id, created_at: { gte: today } },
  });

  const todayTotals = todayLogs.reduce(
    (acc: any, log: any) => {
      acc.kcal += Number(log.kcal_snapshot || 0);
      acc.protein += Number(log.protein_snapshot || 0);
      acc.carbs += Number(log.carbs_snapshot || 0);
      acc.fat += Number(log.fat_snapshot || 0);
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // 🚀 ENHANCED: Parse health constraints
  const allergies = p.allergies_json ? (p.allergies_json as string[]) : [];
  const conditions = p.conditions_json ? (p.conditions_json as string[]) : [];
  const preferences = p.preferences_json
    ? (p.preferences_json as string[])
    : [];

  // 🚀 ENHANCED: Meal frequency analysis
  const mealFrequency = recentMeals.length;
  const avgMealsPerDay = mealFrequency / 7;

  return {
    bmi: toNum(p.bmi),
    bmr: toNum(p.bmr),
    tdee: toNum(p.tdee),
    goal: p.goal ?? undefined,
    activity_level: p.activity_level ?? undefined,
    sex: p.sex ?? undefined,
    height_cm: toNum(p.height_cm),
    weight_kg: toNum(p.weight_kg),
    // 🎉 NEW ENHANCED CONTEXT
    enhanced_context: {
      today_consumed: todayTotals,
      today_progress_percent: Math.round(
        (todayTotals.kcal / Number(p.tdee || 2000)) * 100
      ),
      remaining_calories: Math.max(
        0,
        Number(p.tdee || 2000) - todayTotals.kcal
      ),
      recent_meal_frequency: avgMealsPerDay,
      eating_pattern:
        avgMealsPerDay >= 3
          ? "regular"
          : avgMealsPerDay >= 2
          ? "moderate"
          : "irregular",
    },
    health_constraints: {
      allergies,
      conditions,
      preferences,
      has_restrictions: allergies.length > 0 || conditions.length > 0,
    },
  };
}

async function generateNutritionReply(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  ctx?: Awaited<ReturnType<typeof getProfileContext>>
): Promise<string> {
  if (!GEMINI_API_KEY) {
    // Không có API key -> trả lời fallback
    return "Hiện tại hệ thống chưa cấu hình GEMINI_API_KEY nên mình chưa thể sinh trả lời tự động. Bạn hãy cấu hình khóa API rồi thử lại nhé.";
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_ID });

  // 🚀 ENHANCED SYSTEM PROMPT với context siêu thông minh
  const sysLines = [
    "🥗 Bạn là chuyên gia dinh dưỡng AI thông minh, nói tiếng Việt tự nhiên, phân tích dữ liệu thực tế.",
    "📊 LUÔN sử dụng số liệu cụ thể từ profile user: BMI, TDEE, progress hôm nay, eating patterns.",
    "🚫 QUAN TRỌNG: Kiểm tra allergies và conditions trước khi gợi ý món ăn.",
    "🎯 Đưa ra lời khuyên cá nhân hóa dựa trên mục tiêu (lose/gain/maintain) và activity level.",
    "⚖️ Tính toán macro cụ thể cho mỗi gợi ý: kcal, protein(g), carbs(g), fat(g).",
    "🔍 Nhận diện patterns: 'Bạn thường skip bữa sáng', 'Bạn đã ăn X% TDEE hôm nay'.",
    "💡 Đưa insights thông minh: 'Dựa trên 7 ngày qua...', 'Để đạt mục tiêu, bạn nên...'",
    "🌟 Trả lời ngắn gọn nhưng chính xác, có emoji và số liệu cụ thể.",
  ];

  let profileContext = "";
  if (ctx) {
    const bmi = ctx.bmi || 0;
    const bmiCategory =
      bmi < 18.5
        ? "thiếu cân"
        : bmi < 25
        ? "bình thường"
        : bmi < 30
        ? "thừa cân"
        : "béo phì";

    profileContext = `
📋 PROFILE USER:
- Thể chất: ${ctx.sex}, ${ctx.height_cm}cm, ${
      ctx.weight_kg
    }kg, BMI ${bmi} (${bmiCategory})
- Mục tiêu: ${ctx.goal} | Hoạt động: ${ctx.activity_level} | TDEE: ${
      ctx.tdee
    } kcal/ngày

📈 TIẾN TRÌNH HÔM NAY:
- Đã tiêu thụ: ${ctx.enhanced_context?.today_consumed?.kcal || 0} kcal (${
      ctx.enhanced_context?.today_progress_percent || 0
    }% TDEE)
- Protein: ${ctx.enhanced_context?.today_consumed?.protein || 0}g | Carbs: ${
      ctx.enhanced_context?.today_consumed?.carbs || 0
    }g | Fat: ${ctx.enhanced_context?.today_consumed?.fat || 0}g
- Còn lại: ${ctx.enhanced_context?.remaining_calories || 0} kcal có thể ăn

🍽️ PATTERNS 7 NGÀY:
- Tần suất ăn: ${
      ctx.enhanced_context?.recent_meal_frequency?.toFixed(1) || 0
    } bữa/ngày (${ctx.enhanced_context?.eating_pattern || "unknown"})

⚠️ RÀNG BUỘC SỨC KHỎE:
${
  ctx.health_constraints?.allergies?.length > 0
    ? `- Dị ứng: ${ctx.health_constraints.allergies.join(", ")}`
    : "- Không dị ứng"
}
${
  ctx.health_constraints?.conditions?.length > 0
    ? `- Tình trạng: ${ctx.health_constraints.conditions.join(", ")}`
    : "- Không có bệnh lý"
}
${
  ctx.health_constraints?.preferences?.length > 0
    ? `- Sở thích: ${ctx.health_constraints.preferences.join(", ")}`
    : "- Không có sở thích đặc biệt"
}

🎯 HƯỚNG DẪN TỰ ĐỘNG:
- Khi user hỏi gì ăn: Tham khảo calories còn lại + allergies + preferences
- Khi user hỏi về progress: So sánh với TDEE target, đưa % cụ thể
- Khi user hỏi eating pattern: Phân tích frequency 7 ngày, gợi ý cải thiện
- Luôn đề cập đến mục tiêu ${ctx.goal} trong mọi lời khuyên
`;
  } else {
    profileContext =
      "❌ CHƯA CÓ PROFILE USER - Hãy tạo profile trước để được tư vấn cá nhân hóa!";
  }

  const systemPrompt = `${sysLines.join("\n")}\n${profileContext}`;

  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    ...messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
  ];

  try {
    const resp = await model.generateContent({ contents });
    const text = resp.response.text() || "";
    return text.trim();
  } catch (error) {
    console.error("🚨 Gemini API Error:", error);
    return "Xin lỗi, hệ thống AI tạm thời gặp sự cố. Vui lòng thử lại sau ít phút. 🤖💔";
  }
}

export class ChatbotController {
  // POST /chat/sessions
  static async createSession(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const s = await prisma.chat_sessions.create({
        data: { user_id, started_at: new Date(), lang: "vi" },
      });
      res.json({ session_id: s.id });
    } catch (error) {
      console.error("❌ createSession error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /chat/sessions  (?limit=10)
  static async getSessions(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
      const sessions = await prisma.chat_sessions.findMany({
        where: { user_id },
        orderBy: { started_at: "desc" },
        take: limit,
      });
      res.json({ sessions });
    } catch (error) {
      console.error("❌ getSessions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // POST /chat/messages
  // Body: { session_id, role, content, top_passages?, meta? }
  static async createMessage(req: Request, res: Response) {
    try {
      const parsed = ChatMsgBody.safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });

      const user_id = (req as any).userId as bigint;
      const session_id = BigInt(parsed.data.session_id as any);

      // đảm bảo session thuộc về user hiện tại (bảo mật)
      const session = await prisma.chat_sessions.findUnique({
        where: { id: session_id },
      });
      if (!session || session.user_id !== user_id) {
        return res.status(404).json({ error: "Session not found" });
      }

      // 1) Lấy turn_index kế tiếp
      const last = await prisma.chat_messages.findFirst({
        where: { session_id },
        orderBy: { turn_index: "desc" },
      });
      const nextTurn = (last?.turn_index ?? -1) + 1;

      // 2) Lưu message người dùng (hoặc system/assistant nếu bạn gọi thủ công)
      const userMsg = await prisma.chat_messages.create({
        data: {
          session_id,
          role: parsed.data.role,
          turn_index: nextTurn,
          content: parsed.data.content,
          top_passages: parsed.data.top_passages ?? Prisma.JsonNull,
          meta: parsed.data.meta ?? Prisma.JsonNull,
        },
      });

      // Nếu không phải user nhắn (VD: system seed) thì không cần gọi LLM
      if (parsed.data.role !== "user") {
        await prisma.chat_sessions.update({
          where: { id: session_id },
          data: { updated_at: new Date() },
        });
        return res.json({ message_id: userMsg.id, turn_index: nextTurn });
      }

      // 3) Lấy history gần nhất làm context
      const historyRows = await prisma.chat_messages.findMany({
        where: { session_id },
        orderBy: { turn_index: "asc" },
        take: HISTORY_TAKE,
      });

      const historyForLlm = historyRows.map((m: any) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content as string,
      }));

      // 4) Lấy profile context
      const profileCtx = await getProfileContext(user_id);

      // 5) Gọi LLM
      let llmText = "";
      try {
        llmText = await generateNutritionReply(historyForLlm, profileCtx);
      } catch (llmErr) {
        console.error("⚠️ LLM error:", llmErr);
        llmText =
          "Xin lỗi, hiện mình đang gặp sự cố khi tạo trả lời. Bạn thử lại sau nhé.";
      }

      // 6) Lưu message assistant
      const assistantMsg = await prisma.chat_messages.create({
        data: {
          session_id,
          role: "assistant",
          turn_index: nextTurn + 1,
          content: llmText,
          top_passages: Prisma.JsonNull,
          meta: Prisma.JsonNull,
        },
      });

      // 7) Cập nhật session timestamp
      await prisma.chat_sessions.update({
        where: { id: session_id },
        data: { updated_at: new Date() },
      });

      // 8) Trả về
      res.json({
        user_message: { id: userMsg.id, turn_index: nextTurn },
        assistant_message: {
          id: assistantMsg.id,
          turn_index: nextTurn + 1,
          content: llmText,
        },
      });
    } catch (error) {
      console.error("❌ createMessage error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /chat/sessions/:id/messages
  static async getSessionMessages(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const session_id = BigInt(req.params.id);

      // bảo đảm quyền truy cập
      const session = await prisma.chat_sessions.findUnique({
        where: { id: session_id },
      });
      if (!session || session.user_id !== user_id) {
        return res.status(404).json({ error: "Session not found" });
      }

      const msgs = await prisma.chat_messages.findMany({
        where: { session_id },
        orderBy: { turn_index: "asc" },
      });
      res.json({ messages: msgs });
    } catch (error) {
      console.error("❌ getSessionMessages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default ChatbotController;
