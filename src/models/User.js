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
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    aiQuota: {
      daily: {
        type: Number,
        default: 3,
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

// Index for faster email lookups
userSchema.index({ email: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
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
