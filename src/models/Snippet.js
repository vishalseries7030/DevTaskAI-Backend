const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Snippet title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
      maxlength: [10000, 'Code cannot exceed 10000 characters'],
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      enum: [
        'javascript',
        'python',
        'java',
        'go',
        'rust',
        'typescript',
        'cpp',
        'csharp',
        'ruby',
        'php',
      ],
    },
    tags: {
      type: [String],
      validate: {
        validator: function (tags) {
          return tags.length <= 10 && tags.every((tag) => tag.length <= 20);
        },
        message: 'Maximum 10 tags allowed, each tag max 20 characters',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
snippetSchema.index({ owner: 1, language: 1 });
snippetSchema.index({ tags: 1 });

module.exports = mongoose.model('Snippet', snippetSchema);
