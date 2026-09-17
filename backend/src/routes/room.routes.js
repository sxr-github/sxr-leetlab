import express from "express";
import { authmiddleware } from "../middleware/auth.middleware.js";
import { createRoom, getRoom, getRoomMessages, getRooms, inviteToRoom, leaveRoom } from "../controllers/room.controller.js";

const roomRoutes = express.Router();
roomRoutes.use(authmiddleware);
roomRoutes.get("/", getRooms);
roomRoutes.post("/", createRoom);
roomRoutes.get("/:id", getRoom);
roomRoutes.post("/:id/invite", inviteToRoom);
roomRoutes.delete("/:id/leave", leaveRoom);
roomRoutes.get("/:id/messages", getRoomMessages);

export default roomRoutes;
