/**
 * Centralized Application Logger.
 * Ensures credentials and sensitive data are sanitized before output.
 */

const sanitize = (message) => {
  if (typeof message === 'string') {
    // Redact potential secret keys or bearer tokens
    return message
      .replace(/(secretAccessKey|secretKey|password|token)\s*[:=]\s*["']?[^"'\s]+["']?/gi, '$1: [REDACTED]')
      .replace(/Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, 'Bearer [REDACTED]');
  }
  return message;
};

export const logger = {
  info: (message, ...meta) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${sanitize(message)}`, ...meta.map(m => sanitize(m)));
  },
  warn: (message, ...meta) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${sanitize(message)}`, ...meta.map(m => sanitize(m)));
  },
  error: (message, ...meta) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${sanitize(message)}`, ...meta.map(m => sanitize(m)));
  }
};

export default logger;
