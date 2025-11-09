const express = require('express');
const router = express.Router({ mergeParams: true });
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// Routes for /api/v1/projects/:projectId/tasks
router.route('/').get(protect, getTasks).post(protect, createTask);

// Routes for /api/v1/tasks/:taskId
router.route('/:taskId').put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
