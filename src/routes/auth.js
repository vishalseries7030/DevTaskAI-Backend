const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validator');
const { authRateLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');

router.post('/register', authRateLimiter, validateRegister, register);
router.post('/login', authRateLimiter, validateLogin, login);
router.get('/me', protect, getMe);

module.exports = router;
