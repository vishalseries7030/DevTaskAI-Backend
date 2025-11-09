const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects for user
// @route   GET /api/v1/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error fetching projects',
      },
    });
  }
};

// @desc    Create new project
// @route   POST /api/v1/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    // Validate members exist
    if (members && members.length > 0) {
      const validMembers = await User.find({ _id: { $in: members } });
      if (validMembers.length !== members.length) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'One or more member IDs are invalid',
          },
        });
      }
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      members: members || [],
    });

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error creating project',
      },
    });
  }
};

// @desc    Get project by ID
// @route   GET /api/v1/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        },
      });
    }

    // Check access
    if (!project.hasAccess(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to access this project',
        },
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error fetching project',
      },
    });
  }
};

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        },
      });
    }

    // Only owner can update project
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only project owner can update project',
        },
      });
    }

    const { name, description, members } = req.body;

    // Validate members if provided
    if (members && members.length > 0) {
      const validMembers = await User.find({ _id: { $in: members } });
      if (validMembers.length !== members.length) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'One or more member IDs are invalid',
          },
        });
      }
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (members) project.members = members;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error updating project',
      },
    });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
};
