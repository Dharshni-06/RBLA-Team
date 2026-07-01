const axios = require('axios');

/**
 * Calls your backend proxy for Pollinations sentiment/summary analysis.
 * @param {string[]} reviewTexts - Array of customer review lines (with stars/comments).
 * @returns {Promise<{summary: string}>} - Sentiment analysis result.
 */
async function analyzeSentimentWithPollinations(reviewTexts) {
  const prompt = `
You are a sentiment analysis system. Given the reviews below, return ONLY one word reflecting the overall sentiment: "Positive", "Neutral", or "Negative".
If there are no valid reviews or nothing you can classify, respond ONLY with: "No reviews".
Do NOT provide summary, reasoning, or explanations. Only output that single word.

Reviews:
${reviewTexts.join('\n')}
  `;

  console.log('[pollinationsService] Sending prompt to proxy:', prompt);

  try {
    const response = await axios.post('http://localhost:5000/api/ai/summary', {
      prompt,
      model: "openai"
    }, {
      headers: { "Content-Type": "application/json" }
    });

    console.log('[pollinationsService] Proxy response status:', response.status);
    console.log('[pollinationsService] Proxy response data:', response.data);

    return response.data;
  } catch (error) {
    console.error('[pollinationsService] Proxy call error:', error.message);
    return { summary: 'Sentiment API error (proxy)' };
  }
}

module.exports = { analyzeSentimentWithPollinations };
