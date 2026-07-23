const axios = require('axios');

async function test() {
  const prompt = `You are a sentiment analysis system. Given the reviews below, return ONLY one word reflecting the overall sentiment: "Positive", "Neutral", or "Negative".
If there are no valid reviews or nothing you can classify, respond ONLY with: "No reviews".
Do NOT provide summary, reasoning, or explanations. Only output that single word.

Reviews:
Review 1 (5 stars): Great item!`;

  try {
    console.log('Sending request to local backend proxy on port 5000...');
    const response = await axios.post('http://localhost:5000/api/ai/summary', {
      prompt,
      model: "openai"
    }, {
      headers: { "Content-Type": "application/json" }
    });

    console.log('Status:', response.status);
    console.log('Data:', response.data);
  } catch (err) {
    console.error('Error calling local backend:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
      console.error('Response status:', err.response.status);
    }
  }
}

test();
