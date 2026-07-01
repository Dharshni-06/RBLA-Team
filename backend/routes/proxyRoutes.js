const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get("/proxy", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: "Missing URL parameter" });
    }

    const response = await axios.get(url, { responseType: 'arraybuffer' });
    res.set("Content-Type", response.headers["content-type"] || "image/png");
    res.set("Access-Control-Allow-Origin", "*");
    res.send(response.data);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: "Failed to fetch resource" });
  }
});

module.exports = router;
