const express = require('express');
const router = express.Router({ mergeParams: true });
const { getBugs, createBug, getBugById, updateBug } = require('../controllers/bugController');
const { protect } = require('../middleware/auth');

// Routes for /api/v1/projects/:projectId/bugs
router.route('/').get(protect, getBugs).post(protect, createBug);

// Routes for /api/v1/bugs/:bugId
router.route('/:bugId').get(protect, getBugById).put(protect, updateBug);

module.exports = router;
