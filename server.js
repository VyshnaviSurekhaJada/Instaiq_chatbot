const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ InstaIQ backend is running successfully");
});

app.post("/api/chat", async (req, res) => {
  console.log("🔥 API route hit");

  try {
    console.log("📨 Request body:", req.body);

    const { messages, system } = req.body;

    if (!messages || !Array.isArray(messages)) {
      console.log("❌ Invalid messages");

      return res.status(400).json({
        error: "Invalid messages array",
      });
    }

    console.log("✅ Sending request to Groq");

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content:
              system ||
              "You are InstaIQ chatbot.",
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Groq response received");

    const text =
      response.data?.choices?.[0]?.message?.content ||
      "No response";

    return res.json({
      content: [
        {
          type: "text",
          text,
        },
      ],
    });

  } catch (error) {
    console.error(
      "❌ FULL ERROR:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      error:
        error.response?.data ||
        error.message ||
        "Internal Server Error",
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Proxy server running at http://localhost:${PORT}`);
});