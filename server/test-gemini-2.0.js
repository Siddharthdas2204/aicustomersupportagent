const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Important: No "models/" prefix needed when using getGenerativeModel
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  try {
    const result = await model.generateContent("Say 'Model connection successful'");
    console.log('Gemini Response:', result.response.text());
  } catch (error) {
    console.error('Gemini Test FAILED:', error.message);
  }
}

testGemini();
