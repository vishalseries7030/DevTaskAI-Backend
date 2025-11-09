const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

router.post('/', protect, uploadFile);

module.exports = router;
