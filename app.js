import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

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
const MODEL = "llama3-8b-8192";

/* ================= GENERIC AI ENDPOINT ================= */
/**
 * POST /ai/generate
 * body: {
 *   prompt: string,
 *   temperature?: number,
 *   timeout?: number
 * }
 */
app.post("/ai/generate", async (req, res) => {
  try {
    const { prompt, temperature = 0.7, timeout = 10000 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await axios.post(
      GROQ_URL,
      {
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout,
      }
    );

    res.json({
      content: response.data.choices[0].message.content,
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: "AI request failed" });
  }
});

/* ================= SERVER START ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 