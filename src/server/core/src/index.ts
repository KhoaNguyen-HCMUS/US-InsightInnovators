import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import nutritionRoutes from "./routes/nutrition";
import authRoutes from "./routes/auth";

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api", nutritionRoutes);
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`[Core API] listening on ${PORT}`));


