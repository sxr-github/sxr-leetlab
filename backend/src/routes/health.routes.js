import express from "express";
import { healthCheck } from "../controllers/health.controller.js";

const healthRoutes = express.Router();
healthRoutes.get("/health", healthCheck);
healthRoutes.get("/ping", (req, res) => res.status(200).json({ success: true, message: "pong" }));

export default healthRoutes;
