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
  try {
    const { messages, system } = req.body;

    // Build full conversation history including all past messages
    const formattedMessages = [
      { role: "system", content: system }, // system prompt first
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    console.log(`📨 Sending ${formattedMessages.length} messages to Groq`); // helpful log

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: formattedMessages,  // full history sent every time
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices[0].message.content;
    console.log(`✅ Reply received (${text.length} chars)`);
    res.json({ content: [{ type: "text", text }] });

  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch from Groq API" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Proxy server running at http://localhost:${PORT}`);
});