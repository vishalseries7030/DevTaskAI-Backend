const User = require('../models/User');
const { generateToken } = require('../utils/jwtHelper');

// @desc    Register new user (local email/password)
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name, email and password are required' },
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'An account with this email already exists' },
      });
    }

    // Create user — passwordHash pre-save hook handles bcrypt
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
      provider: 'local',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error creating user: ' + error.message },
    });
  }
};

// @desc    Login user (local email/password)
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
      });
    }

    // OAuth users trying to login with password
    if (user.provider !== 'local' || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'OAUTH_ACCOUNT',
          message: `This account uses ${user.provider} sign-in. Please use that option instead.`,
        },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error logging in' },
    });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        provider: user.provider,
        aiQuota: user.aiQuota,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error fetching user' },
    });
  }
};

// @desc    OAuth callback — called after Google/GitHub success
// @route   used internally by passport strategy callbacks
// @access  Public (via OAuth redirect)
const oauthCallback = (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000'}/login?error=oauth_failed`
      );
    }

    const token = generateToken(user._id);
    const frontendUrl = process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000';

    // Redirect to frontend with token in query param — frontend stores it
    res.redirect(
      `${frontendUrl}/auth/callback?token=${token}&userId=${user._id}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&avatar=${encodeURIComponent(user.avatar || '')}&provider=${user.provider}`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=oauth_error`);
  }
};

module.exports = { register, login, getMe, oauthCallback };
