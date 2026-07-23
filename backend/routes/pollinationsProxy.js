const express = require('express');
const axios = require('axios');
const router = express.Router();

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
 * Generates review summary locally from the customer reviews in the prompt.
 * @param {string} promptText - The prompt text containing reviews.
 * @returns {string} - Computed summary text.
 */
function generateLocalSummary(promptText) {
  const cleanPrompt = promptText.toLowerCase();
  let reviewsText = '';
  
  const reviewsIndex = cleanPrompt.lastIndexOf('reviews:');
  if (reviewsIndex !== -1) {
    reviewsText = promptText.substring(reviewsIndex + 8).trim();
  } else {
    reviewsText = promptText;
  }

  const lines = reviewsText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // If the prompt asks for a single word sentiment, return that word
  if (cleanPrompt.includes('only one word') || cleanPrompt.includes('single word') || cleanPrompt.includes('return only one word')) {
    return analyzeSentimentLocally(lines);
  }

  if (lines.length === 0) {
    return 'No reviews available to summarize.';
  }

  let totalStars = 0;
  let reviewsWithStars = 0;
  const criticalComments = [];
  const positiveComments = [];

  for (const line of lines) {
    const starMatch = line.match(/\((\d+)\s*stars?\)/i);
    let rating = null;
    if (starMatch) {
      rating = parseInt(starMatch[1], 10);
      totalStars += rating;
      reviewsWithStars++;
    }

    const colonIndex = line.indexOf(':');
    let comment = line;
    if (colonIndex !== -1) {
      comment = line.substring(colonIndex + 1).trim();
    }

    if (comment.length > 0) {
      if (rating !== null) {
        if (rating >= 4) {
          positiveComments.push(comment);
        } else if (rating <= 2) {
          criticalComments.push(comment);
        }
      } else {
        const cleanComment = comment.toLowerCase();
        const hasPos = ['great', 'good', 'excellent', 'love', 'amazing', 'perfect', 'nice'].some(w => cleanComment.includes(w));
        const hasNeg = ['bad', 'poor', 'worst', 'terrible', 'hate', 'broke', 'defect'].some(w => cleanComment.includes(w));
        if (hasPos) positiveComments.push(comment);
        else if (hasNeg) criticalComments.push(comment);
      }
    }
  }

  const avgStars = reviewsWithStars > 0 ? (totalStars / reviewsWithStars).toFixed(1) : null;
  
  let summary = '';
  if (avgStars !== null) {
    summary += `Based on customer feedback, this product has an average rating of ${avgStars} out of 5 stars. `;
  } else {
    summary += `Based on customer reviews, `;
  }

  if (positiveComments.length > 0) {
    summary += `Customers highly appreciate the product, frequently praising aspects like: "${positiveComments[0]}". `;
  }
  
  if (criticalComments.length > 0) {
    summary += `However, some customers expressed reservations, mentioning: "${criticalComments[0]}". `;
  }

  if (avgStars !== null) {
    if (parseFloat(avgStars) >= 3.8) {
      summary += `Overall, the majority of reviewers strongly recommend this product.`;
    } else if (parseFloat(avgStars) >= 2.5) {
      summary += `Overall, the general consensus is neutral with moderate satisfaction.`;
    } else {
      summary += `Overall, reviewers express reservations and suggest improvements.`;
    }
  } else {
    summary += `Overall, the feedback is mixed.`;
  }

  return summary;
}

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

    let responseData;
    try {
      const response = await axios.post('https://text.pollinations.ai/', requestBody, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      console.log('[Proxy] Pollinations response status:', response.status);
      responseData = response.data;
    } catch (apiErr) {
      console.warn('[Proxy] Pollinations API request failed, generating local fallback:', apiErr.message);
      responseData = generateLocalSummary(req.body.prompt);
    }

    if (responseData && typeof responseData === 'object') {
      return res.json(responseData);
    }

    return res.json({ summary: responseData });

  } catch (err) {
    console.error('[Proxy] Error communicating with Pollinations:', err.message);
    res.status(500).json({ error: 'AI summary proxy error', detail: err.message });
  }
});

module.exports = router;

