const { getModel } = require('../config/ai');
const { sanitizeLogs } = require('./sanitizer');

// ─── Bug Fix Suggestion ───────────────────────────────────────────────────────

const createBugFixPrompt = (title, description, logs, language) => {
  const sanitizedLogs = logs ? sanitizeLogs(logs) : 'No logs provided';
  return `You are an expert senior full-stack developer. Provide concise probable causes and code fixes for the following bug.

Bug Title: ${title}
Description: ${description}
Logs: ${sanitizedLogs}
Language/Framework: ${language || 'Not specified'}

Please provide:
1. Probable cause (2-3 sentences)
2. Suggested fix (code block with comments)
3. Prevention tips (1-2 sentences)`;
};

const generateBugFixSuggestion = async (title, description, logs, language) => {
  try {
    const model = getModel();
    const prompt = createBugFixPrompt(title, description, logs, language);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const tokensUsed = Math.ceil((prompt.length + text.length) / 4);
    return { suggestion: text, tokensUsed };
  } catch (error) {
    console.error('Gemini AI bug fix error:', error);
    throw new Error('AI service error: ' + error.message);
  }
};

// ─── Code Generation ──────────────────────────────────────────────────────────

const createCodeGenerationPrompt = (prompt, language) => {
  return `You are an expert programmer. Generate clean, well-commented code based on the user's request.

User Request: ${prompt}
Language: ${language}

Provide only the code with inline comments. No explanations outside code blocks.`;
};

const generateCode = async (prompt, language) => {
  try {
    const model = getModel();
    const fullPrompt = createCodeGenerationPrompt(prompt, language);
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    const tokensUsed = Math.ceil((fullPrompt.length + text.length) / 4);
    return { code: text, tokensUsed };
  } catch (error) {
    console.error('Gemini AI code generation error:', error);
    throw new Error('AI service error: ' + error.message);
  }
};

// ─── Task Generation ──────────────────────────────────────────────────────────

const createTaskGenerationPrompt = (goal) => {
  return `You are a project management AI assistant. Convert the following goal into a structured list of actionable tasks.

Goal: ${goal}

Generate 5-8 specific, actionable tasks. For each task, provide:
1. A clear, concise title (max 60 characters)
2. A detailed description (2-3 sentences)
3. Priority level: exactly one of "high", "medium", or "low"

Return ONLY a valid JSON array — no markdown fences, no extra text:
[
  {
    "title": "Task title here",
    "description": "Detailed description here",
    "priority": "high"
  }
]`;
};

const generateTasksFromGoal = async (goal) => {
  try {
    const model = getModel();
    const prompt = createTaskGenerationPrompt(goal);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Strip markdown code fences if model wrapped it anyway
    const cleaned = text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('AI did not return a valid JSON array. Please try again.');
    }

    const tasks = JSON.parse(jsonMatch[0]);
    const validTasks = tasks.filter(
      (t) => t.title && t.description && ['high', 'medium', 'low'].includes(t.priority)
    );

    if (validTasks.length === 0) {
      throw new Error('AI returned no valid tasks. Please rephrase your goal and try again.');
    }

    const tokensUsed = Math.ceil((prompt.length + text.length) / 4);
    return { tasks: validTasks, tokensUsed };
  } catch (error) {
    console.error('Gemini AI task generation error:', error);
    throw new Error('AI task generation failed: ' + error.message);
  }
};

module.exports = {
  generateBugFixSuggestion,
  generateCode,
  generateTasksFromGoal,
};
