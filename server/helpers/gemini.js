const {GoogleGenerativeAI} = require("@google/generative-ai");

async function generateContent(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = {generateContent};
