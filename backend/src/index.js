import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import executionRoute from "./routes/executeCode.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import healthRoutes from "./routes/health.routes.js";
import socialRoutes from "./routes/social.routes.js";
import customExecutionRoutes from "./routes/customExecution.routes.js";
import threadRoutes from "./routes/thread.routes.js";
import publicProfileRoutes from "./routes/publicProfile.routes.js";
import roomRoutes from "./routes/room.routes.js";
import { attachSocketServer } from "./libs/socket.js";

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "change-this-development-secret-before-deployment") {
  throw new Error("JWT_SECRET must be set to a secure, non-default value");
}

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const developmentOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins = new Set(isProduction ? configuredOrigins : [...configuredOrigins, ...developmentOrigins]);

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
}));

app.get("/", (req, res) => res.json({ service: "SXR LEETLAB API", status: "ok" }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoute);
app.use("/api/v1/submission", submissionRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/leaderboard", leaderboardRoutes);
app.use("/api/v1/social", socialRoutes);
app.use("/api/v1/execute-custom", customExecutionRoutes);
app.use("/api/v1/threads", threadRoutes);
app.use("/api/v1/users", publicProfileRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1", healthRoutes);
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((error, req, res, next) => {
  if (error?.type === "entity.too.large") return res.status(413).json({ error: "Request body is too large" });
  if (error?.message === "Origin not allowed by CORS") return res.status(403).json({ error: error.message });
  console.error("Unhandled request error:", error);
  return res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT) || 8000;
const server = createServer(app);
attachSocketServer(server, allowedOrigins);
server.listen(port, () => console.log(`Server is running at ${port}`));
