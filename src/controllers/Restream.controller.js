const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { getAuthorizationUrl, getAccessToken, getUserProfile, callRestreamAPI } = require('../../utils/restream');

/**
 * Get OAuth2 authorization URL
 * @route   GET /api/v2/restream/login
 * @access  Public
 */
const getLoginUrl = asyncHandler(async (req, res) => {
  try {
    const { scope, state } = req.query;

    const authUrl = getAuthorizationUrl({
      scope: scope || 'profile.read channel.read event.read',
      state: state || `state_${Date.now()}_${Math.random().toString(36).substring(7)}`
    });

    return sendSuccess(res, {
      authorization_url: authUrl,
      redirect_uri: 'http://localhost:3030/api/v2/restream/oauth/callback'
    }, 'Authorization URL generated successfully', 200);
  } catch (error) {
    console.error('Error generating authorization URL', { error: error.message });
    return sendError(res, error.message || 'Failed to generate authorization URL', 500);
  }
});

/**
 * OAuth2 callback - exchange code for access token
 * @route   GET /api/v2/restream/oauth/callback
 * @access  Public
 */
const oauthCallback = asyncHandler(async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return sendError(res, `OAuth error: ${error}`, 400);
    }

    if (!code) {
      return sendError(res, 'Authorization code is required', 400);
    }

    const tokenResult = await getAccessToken(code);

    if (tokenResult.success) {
      return sendSuccess(res, {
        access_token: tokenResult.access_token,
        token_type: tokenResult.token_type,
        expires_in: tokenResult.expires_in,
        refresh_token: tokenResult.refresh_token,
        scope: tokenResult.scope
      }, 'Authentication successful! You can now use the API.', 200);
    } else {
      return sendError(res, tokenResult.message || 'Authentication failed', tokenResult.status || 400);
    }
  } catch (error) {
    console.error('Error in OAuth callback', { error: error.message });
    return sendError(res, error.message || 'Authentication failed', 500);
  }
});

/**
 * Get user profile
 * @route   GET /api/v2/restream/me
 * @access  Public (requires access token in Authorization header)
 */
const getProfile = asyncHandler(async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return sendError(res, 'Missing authorization header', 401);
    }

    const accessToken = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!accessToken) {
      return sendError(res, 'Missing access token', 401);
    }

    const result = await getUserProfile(accessToken);

    if (result.success) {
      return sendSuccess(res, result.data, 'Profile retrieved successfully', 200);
    } else {
      return sendError(res, result.message || 'Failed to retrieve profile', result.status || 400);
    }
  } catch (error) {
    console.error('Error retrieving profile', { error: error.message });
    return sendError(res, error.message || 'Failed to retrieve profile', 500);
  }
});

/**
 * Call any Restream API endpoint
 * @route   POST /api/v2/restream/api-call
 * @access  Public (requires access token in Authorization header)
 */
const callAPI = asyncHandler(async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return sendError(res, 'Missing authorization header', 401);
    }

    const accessToken = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!accessToken) {
      return sendError(res, 'Missing access token', 401);
    }

    const { endpoint, method = 'GET', body } = req.body;

    if (!endpoint) {
      return sendError(res, 'API endpoint is required', 400);
    }

    const result = await callRestreamAPI(endpoint, accessToken, {
      method: method.toUpperCase(),
      body: body
    });

    if (result.success) {
      return sendSuccess(res, result.data, 'API call successful', 200);
    } else {
      return sendError(res, result.message || 'API call failed', result.status || 400);
    }
  } catch (error) {
    console.error('Error calling Restream API', { error: error.message });
    return sendError(res, error.message || 'Failed to call API', 500);
  }
});

module.exports = {
  getLoginUrl,
  oauthCallback,
  getProfile,
  callAPI
};
