const { generateBugFixSuggestion, generateCode, generateTasksFromGoal } = require('../utils/aiHelper');
const User = require('../models/User');
const UsageLog = require('../models/UsageLog');

// Helper: check quota, return user or error response
const checkQuota = async (userId, res) => {
  const user = await User.findById(userId);
  user.checkAndResetQuota();
  if (user.aiQuota.used >= user.aiQuota.daily) {
    res.status(429).json({
      success: false,
      error: {
        code: 'AI_QUOTA_EXCEEDED',
        message: `Daily AI quota exhausted (${user.aiQuota.daily}/day). Resets at midnight UTC.`,
        details: { resetAt: user.aiQuota.resetAt },
      },
    });
    return null;
  }
  return user;
};

// @desc    Get AI bug fix suggestion
// @route   POST /api/v1/ai/suggest-fix
// @access  Private
const suggestFix = async (req, res) => {
  try {
    const { bugDescription, logs, language, bugTitle } = req.body;

    if (!bugDescription) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Bug description is required' },
      });
    }

    const user = await checkQuota(req.user.id, res);
    if (!user) return;

    const { suggestion, tokensUsed } = await generateBugFixSuggestion(
      bugTitle || 'Bug Report',
      bugDescription,
      logs,
      language
    );

    user.aiQuota.used += 1;
    await user.save();

    await UsageLog.create({
      user: req.user.id,
      action: 'ai_request',
      meta: { endpoint: '/ai/suggest-fix', tokensUsed, success: true },
    });

    res.status(200).json({
      success: true,
      suggestion,
      tokensUsed,
      quotaRemaining: user.aiQuota.daily - user.aiQuota.used,
    });
  } catch (error) {
    console.error('AI suggest fix error:', error);
    try {
      await UsageLog.create({
        user: req.user.id,
        action: 'ai_request',
        meta: { endpoint: '/ai/suggest-fix', success: false, errorMessage: error.message },
      });
    } catch (_) {}
    res.status(502).json({
      success: false,
      error: { code: 'AI_SERVICE_ERROR', message: error.message || 'Error generating AI suggestion' },
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
        error: { code: 'VALIDATION_ERROR', message: 'Prompt and language are required' },
      });
    }

    const user = await checkQuota(req.user.id, res);
    if (!user) return;

    const { code, tokensUsed } = await generateCode(prompt, language);

    user.aiQuota.used += 1;
    await user.save();

    await UsageLog.create({
      user: req.user.id,
      action: 'ai_request',
      meta: { endpoint: '/ai/generate-snippet', tokensUsed, success: true },
    });

    res.status(200).json({
      success: true,
      code,
      tokensUsed,
      quotaRemaining: user.aiQuota.daily - user.aiQuota.used,
    });
  } catch (error) {
    console.error('AI generate snippet error:', error);
    try {
      await UsageLog.create({
        user: req.user.id,
        action: 'ai_request',
        meta: { endpoint: '/ai/generate-snippet', success: false, errorMessage: error.message },
      });
    } catch (_) {}
    res.status(502).json({
      success: false,
      error: { code: 'AI_SERVICE_ERROR', message: error.message || 'Error generating code' },
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
        error: { code: 'VALIDATION_ERROR', message: 'Goal description is required' },
      });
    }

    const user = await checkQuota(req.user.id, res);
    if (!user) return;

    // Uses aiHelper — no undefined genAI reference
    const { tasks, tokensUsed } = await generateTasksFromGoal(goal);

    user.aiQuota.used += 1;
    await user.save();

    await UsageLog.create({
      user: req.user.id,
      action: 'ai_request',
      meta: {
        endpoint: '/ai/generate-tasks',
        tokensUsed,
        success: true,
      },
    });

    res.status(200).json({
      success: true,
      tasks,
      tokensUsed,
      quotaRemaining: user.aiQuota.daily - user.aiQuota.used,
    });
  } catch (error) {
    console.error('AI task generation error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'AI_SERVICE_ERROR', message: error.message || 'Failed to generate tasks' },
    });
  }
};

module.exports = { suggestFix, generateSnippet, generateTasks };
