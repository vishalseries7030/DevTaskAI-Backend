const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { register, login, getMe, oauthCallback } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validator');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');

// ─── Local Auth ───────────────────────────────────────────────────────────────
router.post('/register', authRateLimiter, validateRegister, register);
router.post('/login', authRateLimiter, validateLogin, login);
router.get('/me', protect, getMe);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_failed' }),
  oauthCallback
);

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login?error=github_failed' }),
  oauthCallback
);

module.exports = router;
