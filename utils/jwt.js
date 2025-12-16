const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - User data to encode
 * @param {string} secret - JWT secret key
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate access token
 * @param {Object} user - User object
 * @returns {string} Access token
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    user_id: user.user_id,
    email: user.email,
    name: user.name,
    type: 'access'
  };
  
  const secret = 'newuserToken';
  return generateToken(
    payload, 
    secret, 
    '7d'
  );
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    user_id: user.user_id,
    type: 'refresh'
  };
  
  const secret = 'newuserToken';
  return generateToken(
    payload, 
    secret, 
    '30d'
  );
};

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object containing access and refresh tokens
 */
const generateTokens = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT secret key
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    // Preserve the original error so we can check error.name in auth middleware
    throw error;
  }
};

/**
 * Verify access token
 * @param {string} token - Access token to verify
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  const secret = 'newuserToken';
  return verifyToken(token, secret);
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  const secret = 'newuserToken';
  return verifyToken(token, secret);
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date} Token expiration date
 */
const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  return new Date(decoded.exp * 1000);
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
const isTokenExpired = (token) => {
  const expiration = getTokenExpiration(token);
  return expiration < new Date();
};

module.exports = {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired
};
