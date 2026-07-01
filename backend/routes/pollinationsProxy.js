const express = require('express');
const axios = require('axios');
const router = express.Router();

// POST /api/ai/summary
router.post('/summary', async (req, res) => {
  try {
    console.log('[Proxy] Received prompt:', req.body);

    const requestBody = {
      model: req.body.model || 'openai',
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: req.body.prompt }
      ]
    };

    console.log('[Proxy] Sending to Pollinations:', requestBody);

    const response = await axios.post('https://text.pollinations.ai/', requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('[Proxy] Pollinations response status:', response.status);

    if (typeof response.data === 'object') {
      return res.json(response.data);
    }

    return res.json({ summary: response.data });

  } catch (err) {
    console.error('[Proxy] Error communicating with Pollinations:', err.message);
    res.status(500).json({ error: 'AI summary proxy error', detail: err.message });
  }
});

module.exports = router;
