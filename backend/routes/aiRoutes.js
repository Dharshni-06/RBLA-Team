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

// Restricted terms for product customizer (No adult content, no human photos/portraits, no intimacy)
const RESTRICTED_PATTERNS = [
  // Humans, portraits, figures
  "people", "pepole", "peopel", "person", "human", "humans", "girl", "boy", "man", "woman", "men", "women", "lady", "guy", "child", "kid", "couple", "couples", "model", "face", "portrait", "body", "back", "cleavage", "chest", "waist", "thigh", "leg", "legs", "skin", "babe", "female", "male",
  // Intimacy & romantic
  "kiss", "kissing", "kisses", "hug", "hugging", "embrace", "romantic", "romance", "lovemaking", "intimate", "intimacy", "sexy", "sensual", "hot", "seductive", "topless", "bikini", "underwear",
  // Adult & NSFW
  "adult", "nsfw", "nude", "naked", "sex", "sexual", "porn", "porno", "pornography", "erotic", "xxx", "boobs", "breast", "breasts", "vagina", "penis", "dick", "cock", "pussy", "ass", "butt", "nakedness", "hentai", "ecchi", "strip", "stripper", "lingerie", "explicit", "gore", "blood", "bloody", "kill", "murder", "weapon", "violence", "suicide", "drug", "drugs", "cocaine", "heroin"
];

function isContentRestricted(text) {
  if (!text) return false;
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = clean.split(/\s+/).filter(Boolean);
  
  return RESTRICTED_PATTERNS.some((term) => {
    return words.some(w => w === term || (term.length >= 4 && w.includes(term)));
  });
}

function getEnhancedProductPrompt(prompt, category) {
  const categoryMap = {
    towel: "woven towel texture pattern",
    bag: "canvas tote bag graphic art print",
    paperfile: "corporate document file folder design pattern",
    napkin: "dining cloth napkin decorative border pattern",
    bedsheet: "cotton bedsheet print pattern",
    cupcoaster: "cup coaster graphic surface art",
    bamboo: "bamboo wood surface graphic pattern"
  };

  const productContext = categoryMap[category] || (category ? `${category} product design pattern` : "product graphic pattern");
  return `${prompt.trim()}, ${productContext}, seamless graphic design pattern, vector illustration, product print texture, artistic decoration, no people, no real human faces, no realistic humans, no portraits, no body photos, family friendly product pattern, vector style`;
}

// Text-to-Image with Pollinations
router.post("/generate", async (req, res) => {
  const { prompt, category } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Enforce Product-Only Restriction (No Humans, No Intimacy, No Adult Content)
  if (isContentRestricted(prompt)) {
    console.warn(`🛑 Inappropriate / Non-product prompt blocked: "${prompt}"`);
    return res.status(400).json({
      error: "🚫 Photos of people, human figures, intimate scenes, or adult content cannot be generated! Please describe product patterns, textures, prints, or artistic graphics."
    });
  }

  // Enhance prompt with product context and safety constraints
  const finalPrompt = getEnhancedProductPrompt(prompt, category);

  const apiKey = process.env.POLLINATIONS_API_KEY;
  let useFallback = !apiKey;
  let responseData;

  if (apiKey) {
    try {
      console.log("👉 Sending prompt to Pollinations using API Key:", finalPrompt);
      let url = `https://gen.pollinations.ai/image/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&nologo=true`;
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Authorization": `Bearer ${apiKey}`
      };

      const response = await axios.get(url, {
        responseType: "arraybuffer",
        headers,
        timeout: 5000
      });
      responseData = response.data;
      useFallback = false;
    } catch (err) {
      console.warn(`⚠️ API Key generation failed (${err.response?.status || err.message}), falling back to keyless Pollinations endpoint.`);
      useFallback = true;
    }
  }

  if (useFallback) {
    try {
      console.log("👉 Sending prompt to free/keyless Pollinations endpoint:", finalPrompt);
      const randomSeed = Math.floor(Math.random() * 10000000);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&seed=${randomSeed}&nologo=true`;
      
      const response = await axios.get(fallbackUrl, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
        },
        timeout: 30000
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
