import express from "express";
import { authmiddleware } from "../middleware/auth.middleware.js";
import { getMonthlyLeaderboard } from "../controllers/leaderboard.controller.js";

const leaderboardRoutes = express.Router();
leaderboardRoutes.get("/monthly", authmiddleware, getMonthlyLeaderboard);

export default leaderboardRoutes;
