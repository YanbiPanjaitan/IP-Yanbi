const {GoogleGenerativeAI} = require("@google/generative-ai");

async function generateContent(prompt) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = {generateContent};
