import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 AI requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

/* ================= BASIC MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ================= BASIC ROUTES ================= */
app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.get("/about", (req, res) => {
  res.send("<h1>About Page</h1>");
});

/* ================= AI CONFIG ================= */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

/* ================= GENERIC AI ENDPOINT ================= */
/**
 * POST /ai/generate
 * body: {
 *   prompt: string,
 *   temperature?: number,
 *   timeout?: number
 * }
 */
console.log(
    "GROQ_API_KEY present:",
    Boolean(process.env.GROQ_API_KEY)
  );
  
  app.post('/ai/generate', aiLimiter, async (req, res) => {
    try {
      console.log(
        "GROQ_API_KEY present:",
        Boolean(process.env.GROQ_API_KEY)
      );
  
      const { prompt, temperature = 0.7, timeout = 10000 } = req.body;
  
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
  
      const response = await axios.post(
        GROQ_URL,
        {
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          stream: false, // Groq supports stream=true later if needed
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout,
        },
      );
      
      const usage = response.data.usage || {};

      console.log('AI USAGE:', {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
      });
      
      res.json({
        content: response.data.choices[0].message.content,
        usage,
      });
      
    } catch (err) {
      console.error("GROQ ERROR:", err?.response?.data || err.message);
      res.status(500).json({ error: "AI request failed" });
    }
  });
  

/* ================= SERVER START ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 