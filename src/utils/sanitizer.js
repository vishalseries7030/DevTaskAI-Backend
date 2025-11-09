// Patterns to detect and remove PII
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_PATTERN = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
const API_KEY_PATTERN = /\b[A-Za-z0-9_-]{20,}\b/g;
const IP_PATTERN = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

// Sanitize text to remove PII
const sanitizeText = (text) => {
  if (!text) return text;

  let sanitized = text;

  // Replace emails
  sanitized = sanitized.replace(EMAIL_PATTERN, '[EMAIL_REDACTED]');

  // Replace phone numbers
  sanitized = sanitized.replace(PHONE_PATTERN, '[PHONE_REDACTED]');

  // Replace potential API keys (long alphanumeric strings)
  sanitized = sanitized.replace(API_KEY_PATTERN, (match) => {
    // Only redact if it looks like an API key (contains mix of chars and numbers)
    if (/[A-Za-z]/.test(match) && /[0-9]/.test(match) && match.length > 25) {
      return '[API_KEY_REDACTED]';
    }
    return match;
  });

  // Replace IP addresses
  sanitized = sanitized.replace(IP_PATTERN, '[IP_REDACTED]');

  return sanitized;
};

// Sanitize logs object
const sanitizeLogs = (logs) => {
  if (typeof logs === 'string') {
    return sanitizeText(logs);
  }

  if (typeof logs === 'object') {
    return sanitizeText(JSON.stringify(logs, null, 2));
  }

  return logs;
};

module.exports = {
  sanitizeText,
  sanitizeLogs,
};
