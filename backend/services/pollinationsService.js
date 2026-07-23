const axios = require('axios');

/**
 * Analyzes review sentiment locally based on stars rating and text keywords.
 * @param {string[]} reviewTexts - Array of review lines.
 * @returns {string} - "Positive", "Neutral", "Negative", or "No reviews".
 */
function analyzeSentimentLocally(reviewTexts) {
  if (!reviewTexts || reviewTexts.length === 0) {
    return 'No reviews';
  }

  let totalStars = 0;
  let reviewsWithStars = 0;
  let positiveWordsCount = 0;
  let negativeWordsCount = 0;

  const posWords = ['great', 'good', 'excellent', 'love', 'amazing', 'beautiful', 'perfect', 'happy', 'nice', 'super', 'best', 'awesome', 'satisfied', 'glad', 'wonderful', 'cool', 'fine', 'recommend'];
  const negWords = ['bad', 'poor', 'worst', 'terrible', 'hate', 'broke', 'disappointed', 'issue', 'defect', 'return', 'waste', 'useless', 'cheap', 'slow', 'error', 'defect', 'refund'];

  for (const review of reviewTexts) {
    const starMatch = review.match(/\((\d+)\s*stars?\)/i);
    if (starMatch) {
      const stars = parseInt(starMatch[1], 10);
      totalStars += stars;
      reviewsWithStars++;
    }

    const cleanText = review.toLowerCase();
    for (const w of posWords) {
      const regex = new RegExp('\\b' + w + '\\b', 'g');
      const matches = cleanText.match(regex);
      if (matches) {
        positiveWordsCount += matches.length;
      }
    }
    for (const w of negWords) {
      const regex = new RegExp('\\b' + w + '\\b', 'g');
      const matches = cleanText.match(regex);
      if (matches) {
        negativeWordsCount += matches.length;
      }
    }
  }

  if (reviewsWithStars > 0) {
    const avgStars = totalStars / reviewsWithStars;
    if (avgStars >= 3.8) {
      return 'Positive';
    } else if (avgStars >= 2.5) {
      return 'Neutral';
    } else {
      return 'Negative';
    }
  }

  if (positiveWordsCount > negativeWordsCount) {
    return 'Positive';
  } else if (negativeWordsCount > positiveWordsCount) {
    return 'Negative';
  } else {
    return 'Neutral';
  }
}

/**
 * Calls your backend proxy for Pollinations sentiment/summary analysis.
 * @param {string[]} reviewTexts - Array of customer review lines (with stars/comments).
 * @returns {Promise<{summary: string}>} - Sentiment analysis result.
 */
async function analyzeSentimentWithPollinations(reviewTexts) {
  if (!reviewTexts || reviewTexts.length === 0) {
    return { summary: 'No reviews' };
  }

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
      headers: { "Content-Type": "application/json" },
      timeout: 5000
    });

    console.log('[pollinationsService] Proxy response status:', response.status);
    console.log('[pollinationsService] Proxy response data:', response.data);

    if (response.data) {
      const result = (response.data.summary || response.data.completion || '').trim();
      if (['Positive', 'Neutral', 'Negative', 'No reviews'].includes(result)) {
        return { summary: result };
      }
    }
    
    throw new Error('Invalid response from Pollinations');
  } catch (error) {
    console.warn('[pollinationsService] Proxy call error, falling back to local analysis:', error.message);
    const localResult = analyzeSentimentLocally(reviewTexts);
    console.log('[pollinationsService] Local sentiment fallback result:', localResult);
    return { summary: localResult };
  }
}

module.exports = { analyzeSentimentWithPollinations };

