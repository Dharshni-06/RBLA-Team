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

  const apiKey = process.env.POLLINATIONS_API_KEY;
  let useFallback = !apiKey;
  let responseData;

  if (apiKey) {
    try {
      console.log("👉 Sending prompt to Pollinations using API Key:", prompt);
      let url = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&nologo=true&key=${apiKey}`;
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Authorization": `Bearer ${apiKey}`
      };

      const response = await axios.get(url, {
        responseType: "arraybuffer",
        headers,
        timeout: 15000
      });
      responseData = response.data;
    } catch (err) {
      console.warn("⚠️ API Key generation failed, falling back to keyless Pollinations endpoint:", err.message);
      useFallback = true;
    }
  }

  if (useFallback) {
    try {
      console.log("👉 Sending prompt to free/keyless Pollinations endpoint:", prompt);
      const randomSeed = Math.floor(Math.random() * 10000000);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.trim())}?width=1024&height=1024&seed=${randomSeed}&nologo=true`;
      
      const response = await axios.get(fallbackUrl, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
        },
        timeout: 15000
      });
      responseData = response.data;
    } catch (err) {
      console.error("❌ Keyless Pollinations endpoint also failed:", err.message);
      return res.status(500).json({ error: "AI generation failed on both authenticated and keyless endpoints: " + err.message });
    }
  }

  const base64Image = `data:image/png;base64,${Buffer.from(responseData).toString("base64")}`;
  return res.json({ image: base64Image });
});

module.exports = router;
