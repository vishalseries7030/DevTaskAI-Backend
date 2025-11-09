const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['ai_request', 'create_bug', 'create_task', 'create_snippet'],
  },
  meta: {
    endpoint: String,
    tokensUsed: Number,
    success: Boolean,
    errorMessage: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
usageLogSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('UsageLog', usageLogSchema);
