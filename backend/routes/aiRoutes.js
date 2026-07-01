const express = require('express');
const axios = require('axios');
const cors = require('cors');

const router = express.Router();

router.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
router.use(express.json({ limit: '50mb' }));

// Text-to-Image with Pollinations
router.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    console.log("👉 Sending prompt to Pollinations:", prompt);
    const apiKey = process.env.POLLINATIONS_API_KEY;
    
    // Use gen.pollinations.ai/image endpoint for proper key authentication
    let url = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&nologo=true`;
    if (apiKey) {
      url += `&key=${apiKey}`;
    }

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers
    });

    const base64Image = `data:image/png;base64,${Buffer.from(
      response.data
    ).toString("base64")}`;

    return res.json({ image: base64Image });
  } catch (err) {
    let errMsg = err.message;
    if (err.response && err.response.data) {
      try {
        const bodyText = Buffer.from(err.response.data).toString('utf8');
        console.error("❌ Pollinations API error response body:", bodyText);
        const parsed = JSON.parse(bodyText);
        if (parsed.error && parsed.error.message) {
          errMsg = parsed.error.message;
        } else if (parsed.error) {
          errMsg = parsed.error;
        }
      } catch (e) {
        // Response is not JSON
      }
    }
    console.error("❌ AI Generation Exception:", errMsg);
    return res.status(500).json({ error: errMsg });
  }
});

module.exports = router;
