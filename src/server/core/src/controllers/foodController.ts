import { Request, Response } from "express";

const prisma = require("../../prisma/client");

export class FoodController {
  // GET /foods?query=&page=1&pageSize=20
  static async searchFoods(req: Request, res: Response) {
    try {
      const query = (req.query.query as string) || "";
      const page = Math.max(1, Number(req.query.page || 1));
      const pageSize = Math.min(
        50,
        Math.max(1, Number(req.query.pageSize || 20))
      );

      const where = query
        ? { name: { contains: query, mode: "insensitive" as const } }
        : {};

      const [items, total] = await Promise.all([
        prisma.foods.findMany({
          where,
          orderBy: { name: "asc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.foods.count({ where }),
      ]);

      res.json({ items, page, pageSize, total });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /foods/:id
  static async getFoodById(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id);
      const food = await prisma.foods.findUnique({ where: { id } });
      if (!food) return res.status(404).json({ error: "Not found" });
      res.json(food);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
