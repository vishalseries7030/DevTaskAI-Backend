const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks for a project
// @route   GET /api/v1/projects/:projectId/tasks
// @access  Private
const getTasks = async (req, res) => {
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

    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error fetching tasks',
      },
    });
  }
};

// @desc    Create task
// @route   POST /api/v1/projects/:projectId/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignee, priority, dueDate } = req.body;

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

    // Validate assignee is project member
    if (assignee && !project.hasAccess(assignee)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Assignee must be a project member',
        },
      });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignee,
      priority,
      dueDate,
    });

    await task.populate('assignee', 'name email');

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error creating task',
      },
    });
  }
};

// @desc    Update task
// @route   PUT /api/v1/tasks/:taskId
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found',
        },
      });
    }

    // Check project access
    const project = await Project.findById(task.project);
    if (!project.hasAccess(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to update this task',
        },
      });
    }

    const { title, description, status, assignee, priority, dueDate } = req.body;

    // Validate assignee if provided
    if (assignee && !project.hasAccess(assignee)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Assignee must be a project member',
        },
      });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (assignee !== undefined) task.assignee = assignee;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    await task.populate('assignee', 'name email');

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error updating task',
      },
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:taskId
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found',
        },
      });
    }

    // Check project access
    const project = await Project.findById(task.project);
    if (!project.hasAccess(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to delete this task',
        },
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error deleting task',
      },
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
