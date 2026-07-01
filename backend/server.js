// RBLA-full/backend/server.js

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch"; // only needed if Node < 18
import chatbotRoutes from "./routes/chatbotRoutes.js";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Routes
app.use("/api/chatbot", chatbotRoutes);

// Pollinations proxy endpoint
app.post("/api/pollinations", async (req, res) => {
  try {
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add Authorization header if Pollinations requires API key
        // "Authorization": "Bearer YOUR_API_KEY"
      },
      body: JSON.stringify(req.body), // forward the prompt from frontend
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Pollinations fetch error:", error);
    res.status(500).json({ error: "Failed to fetch from Pollinations API" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
