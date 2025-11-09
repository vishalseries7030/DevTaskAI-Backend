const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters'],
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
projectSchema.index({ owner: 1 });
projectSchema.index({ members: 1 });

// Method to check if user has access to project
projectSchema.methods.hasAccess = function (userId) {
  const ownerId = this.owner._id || this.owner;
  const userIdStr = userId.toString();
  
  // Check if user is owner
  if (ownerId.toString() === userIdStr) {
    return true;
  }
  
  // Check if user is in members
  return this.members.some((member) => {
    const memberId = member._id || member;
    return memberId.toString() === userIdStr;
  });
};

module.exports = mongoose.model('Project', projectSchema);
