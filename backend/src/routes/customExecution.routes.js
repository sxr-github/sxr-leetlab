import express from "express";
import { authmiddleware } from "../middleware/auth.middleware.js";
import { executeCustom } from "../controllers/customExecution.controller.js";

const customExecutionRoutes = express.Router();
customExecutionRoutes.post("/", authmiddleware, executeCustom);

export default customExecutionRoutes;
