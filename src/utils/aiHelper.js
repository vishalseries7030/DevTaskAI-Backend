const { getModel } = require('../config/ai');
const { sanitizeLogs } = require('./sanitizer');

// Bug fix suggestion prompt template
const createBugFixPrompt = (title, description, logs, language) => {
  const sanitizedLogs = logs ? sanitizeLogs(logs) : 'No logs provided';

  return `You are an expert senior full-stack developer. Provide concise probable causes and code fixes for the following bug. Return code blocks and short explanation.

Bug Title: ${title}
Description: ${description}
Logs: ${sanitizedLogs}
Language/Framework: ${language || 'Not specified'}

Please provide:
1. Probable cause (2-3 sentences)
2. Suggested fix (code block with comments)
3. Prevention tips (1-2 sentences)`;
};

// Code generation prompt template
const createCodeGenerationPrompt = (prompt, language) => {
  return `You are an expert programmer. Generate clean, well-commented code based on the user's request.

User Request: ${prompt}
Language: ${language}

Provide only the code with inline comments. No explanations outside code blocks.`;
};

// Call Gemini AI for bug fix suggestion
const generateBugFixSuggestion = async (title, description, logs, language) => {
  try {
    const model = getModel();
    const prompt = createBugFixPrompt(title, description, logs, language);

    // Use simpler format - just pass the prompt string
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('AI Response text length:', text.length); // Debug log
    console.log('AI Response preview:', text.substring(0, 100)); // Debug log

    // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
    const tokensUsed = Math.ceil((prompt.length + text.length) / 4);

    return {
      suggestion: text,
      tokensUsed,
    };
  } catch (error) {
    console.error('Gemini AI error:', error);
    throw new Error('AI service error: ' + error.message);
  }
};

// Call Gemini AI for code generation
const generateCode = async (prompt, language) => {
  try {
    const model = getModel();
    const fullPrompt = createCodeGenerationPrompt(prompt, language);

    // Use simpler format - just pass the prompt string
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Estimate tokens
    const tokensUsed = Math.ceil((fullPrompt.length + text.length) / 4);

    return {
      code: text,
      tokensUsed,
    };
  } catch (error) {
    console.error('Gemini AI error:', error);
    throw new Error('AI service error: ' + error.message);
  }
};

module.exports = {
  generateBugFixSuggestion,
  generateCode,
};
