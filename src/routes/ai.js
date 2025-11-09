const express = require('express');
const router = express.Router();
const { suggestFix, generateSnippet, generateTasks } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

router.post('/suggest-fix', protect, aiRateLimiter, suggestFix);
router.post('/generate-snippet', protect, aiRateLimiter, generateSnippet);
router.post('/generate-tasks', protect, aiRateLimiter, generateTasks);

module.exports = router;
