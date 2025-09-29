import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import nutritionRoutes from "./routes/nutrition.js";


dotenv.config();

const app = express();

const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api/nutrition", nutritionRoutes); 
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`[Core API] listening on ${PORT}`));
