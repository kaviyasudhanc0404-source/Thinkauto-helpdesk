import fetch from 'node-fetch';
import ChatLog from '../models/ChatLog.js';

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const sendMessage = async (req, res) => {
  try {
    console.log('=== CHAT REQUEST RECEIVED ===');
    console.log('User:', req.user?.email);
    console.log('Body:', req.body);
    
    const { userMessage, conversationHistory = [] } = req.body;

    if (!userMessage) {
      console.log('ERROR: Message is required');
      return res.status(400).json({ error: "Message is required" });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY not found in environment variables");
      return res.status(500).json({ error: "API configuration error" });
    }

    // Try primary model, fall back to secondary if unavailable
    const MODELS = ["groq/compound", "qwen/qwen3.8-27b"];
    let response = null;
    let lastError = null;

    for (const model of MODELS) {
      response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You are ThinkAuto AI, a helpful and intelligent IT helpdesk assistant for ThinkAuto company. You help employees with technical issues, software problems, hardware troubleshooting, network connectivity, access requests, and general IT queries. Be concise, professional, and helpful. Keep responses under 200 words. If you can't solve an issue directly, suggest creating a support ticket."
            },
            ...conversationHistory,
            {
              role: "user",
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
        }),
      });
      if (response.ok) {
        console.log(`✓ Chatbot responded using model: ${model}`);
        break;
      }
      const errBody = await response.json().catch(() => ({}));
      lastError = errBody;
      console.warn(`Model ${model} failed (${response.status}):`, errBody?.error?.message);
      response = null;
    }

    if (!response) {
      const errMsg = lastError?.error?.message || "All AI models unavailable";
      console.error("All Groq models failed:", errMsg);
      await ChatLog.create({
        user: req.user._id,
        userMessage,
        aiResponse: "Failed to get AI response",
        status: 'failed',
        error: errMsg
      });
      return res.status(503).json({ error: errMsg });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    await ChatLog.create({
      user: req.user._id,
      userMessage,
      aiResponse,
      usage: data.usage,
      status: 'success'
    });

    res.json({ 
      response: aiResponse,
      usage: data.usage 
    });

  } catch (error) {
    console.error("Chat controller error:", error);
    try {
      if (req.user?._id && req.body?.userMessage) {
        await ChatLog.create({
          user: req.user._id,
          userMessage: req.body.userMessage,
          aiResponse: "Internal server error",
          status: 'failed',
          error: error.message
        });
      }
    } catch (logError) {
      console.error("Failed to save chat error log:", logError.message);
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatLogs = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { userMessage: { $regex: search, $options: 'i' } },
        { aiResponse: { $regex: search, $options: 'i' } }
      ];
    }

    const logs = await ChatLog.find(query)
      .populate('user', 'name username email role department')
      .sort({ createdAt: -1 })
      .limit(500);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: { logs }
    });
  } catch (error) {
    console.error("Get chat logs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching consultation logs",
      error: error.message
    });
  }
};
