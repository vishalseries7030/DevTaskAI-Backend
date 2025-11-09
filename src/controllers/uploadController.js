// @desc    Simple file upload endpoint (without S3)
// @route   POST /api/v1/uploads
// @access  Private
const uploadFile = async (req, res) => {
  try {
    // For now, we'll just accept file URLs or base64
    // In production with S3, this would handle presigned URLs
    const { filename, fileData, contentType } = req.body;

    if (!filename || !fileData) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Filename and fileData are required',
        },
      });
    }

    // Return a mock URL (in production, this would be S3 URL)
    const fileUrl = `data:${contentType};base64,${fileData}`;

    res.status(200).json({
      success: true,
      fileUrl,
      filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Error uploading file',
      },
    });
  }
};

module.exports = {
  uploadFile,
};
