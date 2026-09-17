import express from "express";
import { authmiddleware } from "../middleware/auth.middleware.js";
import { acceptFriendRequest, getFriendActivity, getSocialOverview, removeFriendship, searchUsers, sendFriendRequest } from "../controllers/social.controller.js";

const socialRoutes = express.Router();
socialRoutes.use(authmiddleware);
socialRoutes.get("/search", searchUsers);
socialRoutes.get("/overview", getSocialOverview);
socialRoutes.get("/activity", getFriendActivity);
socialRoutes.post("/requests/:userId", sendFriendRequest);
socialRoutes.post("/requests/:requestId/accept", acceptFriendRequest);
socialRoutes.delete("/requests/:requestId", removeFriendship);

export default socialRoutes;
