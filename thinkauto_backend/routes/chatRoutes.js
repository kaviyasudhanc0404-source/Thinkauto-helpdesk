import express from "express";
import { getChatLogs, sendMessage } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Send message to AI chatbot (requires authentication)
router.post("/message", protect, sendMessage);
router.get("/logs", protect, getChatLogs);

export default router;
