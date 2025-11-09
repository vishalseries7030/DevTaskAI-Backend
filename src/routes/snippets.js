const express = require('express');
const router = express.Router();
const {
  getSnippets,
  createSnippet,
  getSnippetById,
  deleteSnippet,
} = require('../controllers/snippetController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getSnippets).post(protect, createSnippet);

router.route('/:id').get(protect, getSnippetById).delete(protect, deleteSnippet);

module.exports = router;
