import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a given user ID.
 * @param {string} userId 
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  return jwt.sign({ userId }, secret, { expiresIn });
};

/**
 * Verify a JWT token.
 * @param {string} token 
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  return jwt.verify(token, secret);
};
