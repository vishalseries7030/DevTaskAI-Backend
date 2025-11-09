const { generateBugFixSuggestion, generateCode } = require('../utils/aiHelper');
const User = require('../models/User');
const UsageLog = require('../models/UsageLog');

// @desc    Get AI bug fix suggestion
// @route   POST /api/v1/ai/suggest-fix
// @access  Private
const suggestFix = async (req, res) => {
  try {
    const { bugDescription, logs, language, bugTitle } = req.body;

    if (!bugDescription) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Bug description is required',
        },
      });
    }

    // Check and reset user quota
    const user = await User.findById(req.user.id);
    user.checkAndResetQuota();

    // Check if user has quota remaining
    if (user.aiQuota.used >= user.aiQuota.daily) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'AI_QUOTA_EXCEEDED',
          message: 'Daily AI quota exhausted. Resets at midnight UTC.',
          details: {
            resetAt: user.aiQuota.resetAt,
          },
        },
      });
    }

    // Generate AI suggestion
    const { suggestion, tokensUsed } = await generateBugFixSuggestion(
      bugTitle || 'Bug Report',
      bugDescription,
      logs,
      language
    );

    // Update user quota
    user.aiQuota.used += 1;
    await user.save();

    // Log usage
    await UsageLog.create({
      user: req.user.id,
      action: 'ai_request',
      meta: {
        endpoint: '/ai/suggest-fix',
        tokensUsed,
        success: true,
      },
    });

    res.status(200).json({
      success: true,
      suggestion,
      tokensUsed,
      quotaRemaining: user.aiQuota.daily - user.aiQuota.used,
    });
  } catch (error) {
    console.error('AI suggest fix error:', error);

    // Log failed usage
    await UsageLog.create({
      user: req.user.id,
      action: 'ai_request',
      meta: {
        endpoint: '/ai/suggest-fix',
        success: false,
        errorMessage: error.message,
      },
    });

    res.status(502).json({
      success: false,
      error: {
        code: 'AI_SERVICE_ERROR',
        message: error.message || 'Error generating AI suggestion',
      },
    });
  }
};

// @desc    Generate code snippet with AI
// @route   POST /api/v1/ai/generate-snippet
// @access  Private
const generateSnippet = async (req, res) => {
  try {
    const { prompt, language } = req.body;

    if (!prompt || !language) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prompt and language are required',
        },
      });
    }

    // Check and reset user quota
    const user = await User.findById(req.user.id);
    user.checkAndResetQuota();

    // Check if user has quota remaining
    if (user.aiQuota.used >= user.aiQuota.daily) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'AI_QUOTA_EXCEEDED',
          message: 'Daily AI quota exhausted. Resets at midnight UTC.',
          details: {
            resetAt: user.aiQuota.resetAt,
          },
        },
      });
    }

    // Generate code
    const { code, tokensUsed } = await generateCode(prompt, language);

    // Update user quota
    user.aiQuota.used += 1;
    await user.save();

    // Log usage
    await UsageLog.create({
      user: req.user.id,
      action: 'ai_request',
      meta: {
        endpoint: '/ai/generate-snippet',
        tokensUsed,
        success: true,
      },
    });

    res.status(200).json({
      success: true,
      code,
      tokensUsed,
      quotaRemaining: user.aiQuota.daily - user.aiQuota.used,
    });
  } catch (error) {
    console.error('AI generate snippet error:', error);

    // Log failed usage
    await UsageLog.create({
      user: req.user.id,
      action: 'ai_request',
      meta: {
        endpoint: '/ai/generate-snippet',
        success: false,
        errorMessage: error.message,
      },
    });

    res.status(502).json({
      success: false,
      error: {
        code: 'AI_SERVICE_ERROR',
        message: error.message || 'Error generating code',
      },
    });
  }
};

// @desc    Generate tasks from goal description
// @route   POST /api/v1/ai/generate-tasks
// @access  Private
const generateTasks = async (req, res) => {
  try {
    const { goal } = req.body;

    if (!goal) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Goal description is required',
        },
      });
    }

    // Check AI quota
    await req.user.checkAndResetQuota();
    if (req.user.aiQuota.used >= req.user.aiQuota.daily) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'QUOTA_EXCEEDED',
          message: 'Daily AI quota exceeded. Please try again tomorrow.',
        },
      });
    }

    // Construct prompt for task generation
    const prompt = `You are a project management AI assistant. Convert the following goal into a structured list of actionable tasks.

Goal: ${goal}

Generate 5-8 specific, actionable tasks. For each task, provide:
1. A clear, concise title (max 60 characters)
2. A detailed description (2-3 sentences)
3. Priority level (high, medium, or low)

Return ONLY a valid JSON array in this exact format:
[
  {
    "title": "Task title here",
    "description": "Detailed description here",
    "priority": "high"
  }
]

Important: Return ONLY the JSON array, no additional text or markdown.`;

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    let tasks = [];
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return res.status(500).json({
        success: false,
        error: {
          code: 'AI_PARSE_ERROR',
          message: 'Failed to parse AI response. Please try again.',
        },
      });
    }

    // Update user's AI quota
    req.user.aiQuota.used += 1;
    await req.user.save();

    // Log AI usage
    await UsageLog.create({
      user: req.user._id,
      action: 'generate_tasks',
      tokensUsed: response.usageMetadata?.totalTokenCount || 0,
      metadata: {
        goal: goal.substring(0, 100),
        tasksGenerated: tasks.length,
      },
    });

    res.status(200).json({
      success: true,
      tasks,
      quotaRemaining: req.user.aiQuota.daily - req.user.aiQuota.used,
    });
  } catch (error) {
    console.error('AI task generation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate tasks. Please try again.',
      },
    });
  }
};

module.exports = {
  suggestFix,
  generateSnippet,
  generateTasks,
};
