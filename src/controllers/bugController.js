const Bug = require('../models/Bug');
const Project = require('../models/Project');

// @desc    Get bugs for a project
// @route   GET /api/v1/projects/:projectId/bugs
// @access  Private
const getBugs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    // Check project access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        },
      });
    }

    if (!project.hasAccess(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to access this project',
        },
      });
    }

    // Build query
    const query = { project: projectId };
    if (status) {
      query.status = status;
    }

    const bugs = await Bug.find(query).populate('reporter', 'name email').sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bugs.length,
      bugs,
    });
  } catch (error) {
    console.error('Get bugs error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error fetching bugs',
      },
    });
  }
};

// @desc    Create bug
// @route   POST /api/v1/projects/:projectId/bugs
// @access  Private
const createBug = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, attachments } = req.body;

    // Check project access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        },
      });
    }

    if (!project.hasAccess(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to access this project',
        },
      });
    }

    // Validate attachments (max 5)
    if (attachments && attachments.length > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Maximum 5 attachments allowed per bug',
        },
      });
    }

    const bug = await Bug.create({
      title,
      description,
      project: projectId,
      reporter: req.user.id,
      attachments: attachments || [],
    });

    await bug.populate('reporter', 'name email');

    res.status(201).json({
      success: true,
      bug,
    });
  } catch (error) {
    console.error('Create bug error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error creating bug',
      },
    });
  }
};

// @desc    Get bug by ID
// @route   GET /api/v1/bugs/:bugId
// @access  Private
const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.bugId).populate('reporter', 'name email');

    if (!bug) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Bug not found',
        },
      });
    }

    // Check project access
    const project = await Project.findById(bug.project);
    if (!project.hasAccess(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to access this bug',
        },
      });
    }

    res.status(200).json({
      success: true,
      bug,
    });
  } catch (error) {
    console.error('Get bug error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error fetching bug',
      },
    });
  }
};

// @desc    Update bug
// @route   PUT /api/v1/bugs/:bugId
// @access  Private
const updateBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.bugId);

    if (!bug) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Bug not found',
        },
      });
    }

    // Check project access
    const project = await Project.findById(bug.project);
    if (!project.hasAccess(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to update this bug',
        },
      });
    }

    const { status, aiSuggestion } = req.body;

    if (status) bug.status = status;
    if (aiSuggestion) bug.aiSuggestion = aiSuggestion;

    await bug.save();
    await bug.populate('reporter', 'name email');

    res.status(200).json({
      success: true,
      bug,
    });
  } catch (error) {
    console.error('Update bug error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error updating bug',
      },
    });
  }
};

module.exports = {
  getBugs,
  createBug,
  getBugById,
  updateBug,
};
