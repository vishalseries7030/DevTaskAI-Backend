const axios = require('axios');

// @desc    Format JSON
// @route   POST /api/v1/tools/json-format
// @access  Private
const jsonFormat = async (req, res) => {
  try {
    const { json } = req.body;

    if (!json) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'JSON string is required',
        },
      });
    }

    // Try to parse and format JSON
    const parsed = JSON.parse(json);
    const formatted = JSON.stringify(parsed, null, 2);

    res.status(200).json({
      success: true,
      formatted,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid JSON: ' + error.message,
      },
    });
  }
};

// @desc    Proxy API test request
// @route   POST /api/v1/tools/api-test
// @access  Private
const apiTest = async (req, res) => {
  try {
    const { method, url, headers, body } = req.body;

    if (!method || !url) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Method and URL are required',
        },
      });
    }

    // Validate method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!validMethods.includes(method.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid HTTP method',
        },
      });
    }

    const startTime = Date.now();

    // Make the API request
    const response = await axios({
      method: method.toLowerCase(),
      url,
      headers: headers || {},
      data: body,
      timeout: 10000, // 10 second timeout
      validateStatus: () => true, // Don't throw on any status
    });

    const endTime = Date.now();

    res.status(200).json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      body: response.data,
      time: endTime - startTime,
    });
  } catch (error) {
    console.error('API test error:', error);

    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Request timeout after 10 seconds',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Error making API request',
      },
    });
  }
};

// @desc    Test regex pattern
// @route   POST /api/v1/tools/regex-test
// @access  Private
const regexTest = async (req, res) => {
  try {
    const { pattern, flags, testString } = req.body;

    if (!pattern || !testString) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Pattern and test string are required',
        },
      });
    }

    // Create regex with flags
    const regex = new RegExp(pattern, flags || '');
    
    // Test the pattern
    const matches = testString.match(regex);
    const isMatch = regex.test(testString);
    
    // Get all matches if global flag is set
    let allMatches = [];
    if (flags && flags.includes('g')) {
      const globalRegex = new RegExp(pattern, flags);
      let match;
      while ((match = globalRegex.exec(testString)) !== null) {
        allMatches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
        });
      }
    }

    res.status(200).json({
      success: true,
      isMatch,
      matches: matches || [],
      allMatches,
      matchCount: allMatches.length || (matches ? matches.length : 0),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid regex pattern: ' + error.message,
      },
    });
  }
};

module.exports = {
  jsonFormat,
  apiTest,
  regexTest,
};
