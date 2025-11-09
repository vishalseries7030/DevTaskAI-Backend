const s3 = require('../config/aws');

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const ALLOWED_LOG_TYPES = ['text/plain', 'application/json'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_LOG_TYPES];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Validate file type
const isValidFileType = (contentType) => {
  return ALLOWED_TYPES.includes(contentType);
};

// Generate presigned URL for file upload
const generatePresignedUrl = (userId, filename, contentType) => {
  if (!isValidFileType(contentType)) {
    throw new Error('Invalid file type');
  }

  const key = `attachments/${userId}/${Date.now()}-${filename}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Expires: 300, // 5 minutes
    ContentType: contentType,
    ACL: 'private',
  };

  const uploadUrl = s3.getSignedUrl('putObject', params);
  const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    fileUrl,
    key,
    expiresIn: 300,
  };
};

module.exports = {
  generatePresignedUrl,
  isValidFileType,
  MAX_FILE_SIZE,
  ALLOWED_TYPES,
};
