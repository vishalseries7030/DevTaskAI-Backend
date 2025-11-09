const express = require('express');
const router = express.Router();
const { jsonFormat, apiTest, regexTest } = require('../controllers/toolsController');
const { protect } = require('../middleware/auth');

router.post('/json-format', protect, jsonFormat);
router.post('/api-test', protect, apiTest);
router.post('/regex-test', protect, regexTest);

module.exports = router;
