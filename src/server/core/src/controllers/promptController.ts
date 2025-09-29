import { Request, Response } from "express";
import { z } from "zod";

const prisma = require("../../prisma/client");

const PromptBody = z.object({
  prompt_text: z.string(),
  response_text: z.string().optional(),
  purpose: z.string().optional(),
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
      res.json({ id: saved.id });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /healthz
  static async healthCheck(req: Request, res: Response) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ ok: false });
    }
  }
}
