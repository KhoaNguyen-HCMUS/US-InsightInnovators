import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const prisma = require("../../prisma/client");

const ChatMsgBody = z.object({
  session_id: z.string().or(z.number()),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(4000),
  top_passages: z.any().optional(),
  meta: z.any().optional(),
});

export class ChatController {
  // POST /chat/sessions
  static async createSession(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const s = await prisma.chat_sessions.create({
        data: { user_id, started_at: new Date(), lang: "vi" },
      });
      res.json({ session_id: s.id });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /chat/sessions
  static async getSessions(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;
      const sessions = await prisma.chat_sessions.findMany({
        where: { user_id },
        orderBy: { started_at: "desc" },
        take: 10,
      });
      res.json({ sessions });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // POST /chat/messages
  static async createMessage(req: Request, res: Response) {
    try {
      const body = ChatMsgBody.safeParse(req.body);
      if (!body.success)
        return res.status(400).json({ error: body.error.flatten() });

      const session_id = BigInt(body.data.session_id as any);

      const last = await prisma.chat_messages.findFirst({
        where: { session_id },
        orderBy: { turn_index: "desc" },
      });
      const nextTurn = (last?.turn_index ?? -1) + 1;

      const msg = await prisma.chat_messages.create({
        data: {
          session_id,
          role: body.data.role,
          turn_index: nextTurn,
          content: body.data.content,
          top_passages: body.data.top_passages ?? Prisma.JsonNull,
          meta: body.data.meta ?? Prisma.JsonNull,
        },
      });

      res.json({ message_id: msg.id, turn_index: nextTurn });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /chat/sessions/:id/messages
  static async getSessionMessages(req: Request, res: Response) {
    try {
      const session_id = BigInt(req.params.id);
      const msgs = await prisma.chat_messages.findMany({
        where: { session_id },
        orderBy: { turn_index: "asc" },
      });
      res.json({ messages: msgs });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
