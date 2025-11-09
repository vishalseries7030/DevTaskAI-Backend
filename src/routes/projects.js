const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getProjects).post(protect, createProject);

router.route('/:id').get(protect, getProjectById).put(protect, updateProject);

module.exports = router;
