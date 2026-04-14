const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  try {
    console.log('Testing key starting with:', process.env.OPENAI_API_KEY.substring(0, 15));
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Say hello" }],
    });
    console.log('Success:', response.choices[0].message.content);
  } catch (error) {
    console.error('FAILED:', error.message);
  }
}

test();
