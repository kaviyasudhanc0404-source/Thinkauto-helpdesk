import fetch from 'node-fetch';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Tried in order — the second is a fallback if the first is unavailable
const MODELS = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 10;

// Everything the assistant knows. It answers only about ThinkAuto and IT support.
const SYSTEM_PROMPT = `You are ThinkAuto AI, the assistant built into the ThinkAuto website — an AI-powered IT helpdesk.

ABOUT THINKAUTO
ThinkAuto lets employees report IT problems in plain words. It automatically creates a ticket, uses machine learning to find the category (Network, Hardware, Software, Access, Security, Gmail or Others) and priority (Low, Medium, High, Critical), assigns it to the least-busy technician in the matching department, and keeps everyone updated by email.

HOW TO RAISE A TICKET
1. Employee panel: sign up or sign in as an Employee, open "Raise Ticket", describe the issue and click "Submit Ticket".
2. By email: from the same email address used to register, send an email to freeuse1606@gmail.com with "ThinkAuto" in the subject (e.g. "ThinkAuto - Laptop not connecting to WiFi") and the problem in the body (at least 10 characters). ThinkAuto checks the inbox about every minute; emails from unregistered addresses or without "ThinkAuto" in the subject are ignored.
After either method, the employee gets a confirmation email with a ticket number like TKT-000123, and the technician gets an assignment email.

TICKET LIFECYCLE
Statuses: Open → In Progress (or On Hold) → Resolved, or Unsolved.
When the work is done, the technician requests an OTP from the Update Status page; a 6-digit OTP (valid 15 minutes) is emailed to the employee, who shares it with the technician; entering it marks the ticket Resolved. Every ticket must be resolved and verified within 24 hours of creation, otherwise it becomes Unsolved.

ROLES AND PAGES
- Employee: Dashboard, Raise Ticket, My Tickets, History (ticket history), Profile.
- Technician: Dashboard, Assigned Tickets, Update Status, History, Profile. Technicians should set their Department in Profile so matching tickets are routed to them.
- Admin: Command Center dashboard, All Tickets, Assign Tickets, Analytics, Technicians, Employees, Reports, SLA Monitor, History, Settings. Admin accounts cannot be created from the sign-up page.
- Sign up: click "Get Started" on the home page and choose Employee or Technician. "Watch Demo" on the home page shows both ticket flows step by step.

RULES
- Only answer questions about the ThinkAuto website (features, pages, accounts, tickets, statuses, emails) and IT support problems an employee might raise as a ticket (network, hardware, software, access, security, email).
- For anything else (general knowledge, coding, math, news, entertainment, personal topics), politely say you can only help with ThinkAuto and IT support, and suggest what you can help with.
- Never invent features that are not described above. If unsure, say so and suggest raising a ticket.
- Do not ask for or repeat passwords or OTPs.
- Be friendly, clear and concise — under 150 words. Use short steps or bullet points when helpful.
- For an IT problem, give a few quick troubleshooting steps, then suggest raising a ticket if it is not fixed.`;

// Keep only well-formed recent turns so the request stays small and safe
const sanitizeHistory = (history) =>
  (Array.isArray(history) ? history : [])
    .filter((m) => ['user', 'assistant'].includes(m?.role) && typeof m.content === 'string')
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));

// Some models wrap their reasoning in <think> tags — never show it to users
const cleanReply = (text = '') => text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

// @desc    Send a message to the AI assistant (nothing is stored)
// @route   POST /api/chat/message
// @access  Public
export const sendMessage = async (req, res) => {
  const userMessage = typeof req.body?.userMessage === 'string' ? req.body.userMessage.trim() : '';

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (userMessage.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `Message must be under ${MAX_MESSAGE_LENGTH} characters` });
  }
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY not found in environment variables');
    return res.status(500).json({ error: 'API configuration error' });
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...sanitizeHistory(req.body.conversationHistory),
    { role: 'user', content: userMessage }
  ];

  try {
    for (const model of MODELS) {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 1024 })
      });

      const data = await response.json().catch(() => ({}));
      const reply = cleanReply(data.choices?.[0]?.message?.content);

      if (response.ok && reply) {
        return res.json({ response: reply });
      }
      console.warn(`Chat model ${model} failed (${response.status}): ${data.error?.message || 'empty response'}`);
    }

    res.status(503).json({ error: 'AI assistant is temporarily unavailable' });
  } catch (error) {
    console.error('Chat controller error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
