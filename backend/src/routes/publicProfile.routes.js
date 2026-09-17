import express from "express";
import { getPublicProfile, getSolveHeatmap } from "../controllers/publicProfile.controller.js";

const publicProfileRoutes = express.Router();
publicProfileRoutes.get("/:username/profile", getPublicProfile);
publicProfileRoutes.get("/:username/heatmap", getSolveHeatmap);

export default publicProfileRoutes;
