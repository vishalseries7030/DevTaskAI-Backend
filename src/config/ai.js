const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get Gemini model - using gemini-2.5-flash (available in your API key)
const getModel = () => {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash', // This model is available with your API key
  });
};

module.exports = {
  getModel,
};
