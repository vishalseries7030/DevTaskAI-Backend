const Snippet = require('../models/Snippet');

// @desc    Get user's snippets
// @route   GET /api/v1/snippets
// @access  Private
const getSnippets = async (req, res) => {
  try {
    const { language, tag } = req.query;

    // Build query
    const query = { owner: req.user.id };

    if (language) {
      query.language = language;
    }

    if (tag) {
      query.tags = tag;
    }

    const snippets = await Snippet.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: snippets.length,
      snippets,
    });
  } catch (error) {
    console.error('Get snippets error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error fetching snippets',
      },
    });
  }
};

// @desc    Create snippet
// @route   POST /api/v1/snippets
// @access  Private
const createSnippet = async (req, res) => {
  try {
    const { title, code, language, tags } = req.body;

    const snippet = await Snippet.create({
      title,
      code,
      language,
      tags: tags || [],
      owner: req.user.id,
    });

    res.status(201).json({
      success: true,
      snippet,
    });
  } catch (error) {
    console.error('Create snippet error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error creating snippet',
      },
    });
  }
};

// @desc    Get snippet by ID
// @route   GET /api/v1/snippets/:id
// @access  Private
const getSnippetById = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Snippet not found',
        },
      });
    }

    // Check ownership
    if (snippet.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to access this snippet',
        },
      });
    }

    res.status(200).json({
      success: true,
      snippet,
    });
  } catch (error) {
    console.error('Get snippet error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error fetching snippet',
      },
    });
  }
};

// @desc    Delete snippet
// @route   DELETE /api/v1/snippets/:id
// @access  Private
const deleteSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Snippet not found',
        },
      });
    }

    // Check ownership
    if (snippet.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to delete this snippet',
        },
      });
    }

    await snippet.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Snippet deleted successfully',
    });
  } catch (error) {
    console.error('Delete snippet error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error deleting snippet',
      },
    });
  }
};

module.exports = {
  getSnippets,
  createSnippet,
  getSnippetById,
  deleteSnippet,
};
