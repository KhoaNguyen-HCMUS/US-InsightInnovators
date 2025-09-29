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
  const p = await prisma.profiles.findUnique({ where: { user_id } }).catch(() => null);
  if (!p) return undefined;

  const toNum = (d?: Prisma.Decimal | number | null) =>
    d == null ? undefined : Number(d);

  return {
    bmi: toNum(p.bmi),
    bmr: toNum(p.bmr),
    tdee: toNum(p.tdee),
    goal: p.goal ?? undefined,
    activity_level: p.activity_level ?? undefined,
    sex: p.sex ?? undefined,
    height_cm: toNum(p.height_cm),
    weight_kg: toNum(p.weight_kg),
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

  const sysLines = [
    "Bạn là trợ lý dinh dưỡng nói tiếng Việt, trả lời ngắn gọn, có số liệu rõ ràng.",
    "Luôn kiểm tra dị ứng, sở thích nếu người dùng có nêu. Nếu thiếu dữ liệu hãy hỏi lại.",
    "Khi gợi ý thực đơn, ước lượng macro mỗi món (kcal, P/C/F) khi hợp lý.",
  ];

  const profileLine = ctx
    ? `Hồ sơ: ${ctx.sex ?? "?"}, ${ctx.height_cm ?? "?"}cm, ${ctx.weight_kg ?? "?"}kg, Mục tiêu: ${ctx.goal ?? "?"}, Hoạt động: ${ctx.activity_level ?? "?"}, BMI=${ctx.bmi ?? "?"}, BMR=${ctx.bmr ?? "?"}, TDEE=${ctx.tdee ?? "?"}.`
    : "Chưa có hồ sơ người dùng (BMI/BMR/TDEE).";

  const systemPrompt = `${sysLines.join("\n")}\n${profileLine}`;

  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    ...messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
  ];

  const resp = await model.generateContent({ contents });
  const text = resp.response.text() || "";
  return text.trim();
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
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

      const user_id = (req as any).userId as bigint;
      const session_id = BigInt(parsed.data.session_id as any);

      // đảm bảo session thuộc về user hiện tại (bảo mật)
      const session = await prisma.chat_sessions.findUnique({ where: { id: session_id } });
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
        assistant_message: { id: assistantMsg.id, turn_index: nextTurn + 1, content: llmText },
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
      const session = await prisma.chat_sessions.findUnique({ where: { id: session_id } });
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
