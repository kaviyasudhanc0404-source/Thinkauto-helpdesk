import express from "express";
import { sendMessage } from "../controllers/chatController.js";

const router = express.Router();

// Public — the assistant is available on every page, signed in or not
router.post("/message", sendMessage);

export default router;
