const axios = require('axios');

async function test() {
  const prompt = `You are a sentiment analysis system. Given the reviews below, return ONLY one word reflecting the overall sentiment: "Positive", "Neutral", or "Negative".
If there are no valid reviews or nothing you can classify, respond ONLY with: "No reviews".
Do NOT provide summary, reasoning, or explanations. Only output that single word.

Reviews:
Review 1 (5 stars): Excellent product!`;

  const models = ['mistral', 'llama', 'qwen', 'gpt-4o', 'deepseek', 'sur'];

  for (const model of models) {
    const requestBody = {
      model,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    };

    try {
      console.log(`Testing model: ${model}...`);
      const response = await axios.post('https://text.pollinations.ai/', requestBody, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`  Model ${model} SUCCESS! Status: ${response.status}. Data: ${response.data}`);
    } catch (err) {
      console.error(`  Model ${model} FAILED: ${err.message}`);
      if (err.response) {
        console.error(`    Detail:`, err.response.data);
      }
    }
  }
}

test();
