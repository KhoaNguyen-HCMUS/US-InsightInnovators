import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import foodRoutes from "./routes/food";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", foodRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`[Core API] listening on ${PORT}`));
