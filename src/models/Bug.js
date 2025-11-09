const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Bug title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Bug description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    attachments: [
      {
        filename: String,
        url: String,
        contentType: String,
        size: Number,
      },
    ],
    status: {
      type: String,
      enum: ['open', 'inprogress', 'resolved'],
      default: 'open',
    },
    aiSuggestion: {
      content: String,
      tokensUsed: Number,
      generatedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
bugSchema.index({ project: 1, status: 1 });
bugSchema.index({ reporter: 1 });

module.exports = mongoose.model('Bug', bugSchema);
