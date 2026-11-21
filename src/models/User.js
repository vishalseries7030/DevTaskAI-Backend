const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,  // This already creates an index
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    // passwordHash is optional for OAuth users (Google/GitHub/Facebook)
    passwordHash: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
    },
    // OAuth provider fields
    provider: {
      type: String,
      enum: ['local', 'google', 'github', 'facebook'],
      default: 'local',
    },
    providerId: {
      type: String, // OAuth provider's user ID
    },
    avatar: {
      type: String, // Profile picture URL from OAuth
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    aiQuota: {
      daily: {
        type: Number,
        default: 10,
      },
      used: {
        type: Number,
        default: 0,
      },
      resetAt: {
        type: Date,
        default: () => {
          const tomorrow = new Date();
          tomorrow.setUTCHours(24, 0, 0, 0);
          return tomorrow;
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for OAuth lookups — email index already created by unique:true above
userSchema.index({ provider: 1, providerId: 1 });

// Hash password before saving — only for local auth users
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return next();
  }
  // Skip if already hashed (bcrypt hashes start with $2b$)
  if (this.passwordHash.startsWith('$2b$')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to check and reset AI quota
userSchema.methods.checkAndResetQuota = function () {
  const now = new Date();
  if (now >= this.aiQuota.resetAt) {
    this.aiQuota.used = 0;
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0);
    this.aiQuota.resetAt = tomorrow;
  }
};

module.exports = mongoose.model('User', userSchema);
