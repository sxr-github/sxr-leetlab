import express from "express";
import { authmiddleware } from "../middleware/auth.middleware.js";
import { createComment, createThread, getThreads } from "../controllers/thread.controller.js";

const threadRoutes = express.Router();
threadRoutes.get("/:problemId", authmiddleware, getThreads);
threadRoutes.post("/:problemId", authmiddleware, createThread);
threadRoutes.post("/:threadId/comments", authmiddleware, createComment);

export default threadRoutes;
