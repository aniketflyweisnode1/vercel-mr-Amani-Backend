/**
 * Restream.io API utility
 * Handles Restream OAuth2 authentication and API calls
 */

const https = require('https');
const { URL } = require('url');
const logger = require('./logger');

// Restream API configuration
const RESTREAM_CLIENT_ID = 'admin5980';
const RESTREAM_CLIENT_SECRET = 're_10794833_2318bc86ab07ff881e66';
const RESTREAM_REDIRECT_URI = 'http://localhost:3030/api/v2/restream/oauth/callback';
const RESTREAM_AUTH_BASE_URL = 'https://auth.restream.io';
const RESTREAM_API_BASE_URL = 'https://api.restream.io';

/**
 * Get OAuth2 authorization URL
 * @param {Object} options - Authorization options
 * @param {string} options.scope - Requested scopes (default: "profile.read channel.read event.read")
 * @param {string} options.state - State parameter for CSRF protection
 * @returns {string} Authorization URL
 */
const getAuthorizationUrl = (options = {}) => {
  const scope = options.scope || 'profile.read channel.read event.read';
  const state = options.state || `state_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const params = new URLSearchParams({
    client_id: RESTREAM_CLIENT_ID,
    redirect_uri: RESTREAM_REDIRECT_URI,
    response_type: 'code',
    scope: scope,
    state: state
  });

  return `${RESTREAM_AUTH_BASE_URL}/oauth/authorize?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from callback
 * @returns {Promise<Object>} Token response with access_token
 */
const getAccessToken = async (code) => {
  try {
    if (!code || typeof code !== 'string') {
      throw new Error('Authorization code is required');
    }

    const tokenUrl = `${RESTREAM_AUTH_BASE_URL}/oauth/token`;
    // OAuth2 token exchange typically uses application/x-www-form-urlencoded
    const postData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: RESTREAM_REDIRECT_URI,
      client_id: RESTREAM_CLIENT_ID,
      client_secret: RESTREAM_CLIENT_SECRET
    }).toString();

    logger.info('Exchanging authorization code for access token', { code: code.substring(0, 10) + '...' });

    const response = await makeHttpRequest(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: postData
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        access_token: response.data.access_token,
        token_type: response.data.token_type || 'Bearer',
        expires_in: response.data.expires_in,
        refresh_token: response.data.refresh_token,
        scope: response.data.scope,
        fullResponse: response.data
      };
    } else {
      logger.error('Restream token exchange error', { status: response.status, data: response.data });
      return {
        success: false,
        status: response.status,
        message: response.data?.error_description || response.data?.error || 'Token exchange failed',
        data: response.data
      };
    }
  } catch (error) {
    logger.error('Error exchanging authorization code', { error: error.message });
    throw new Error(`Token exchange failed: ${error.message}`);
  }
};

/**
 * Make HTTP request using Node.js https module
 * @param {string} urlString - URL to request
 * @param {Object} options - Request options (method, headers, body)
 * @returns {Promise<Object>} Parsed JSON response
 */
const makeHttpRequest = (urlString, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlString);
      
      const requestOptions = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Node.js Restream API Client',
          ...options.headers
        }
      };

      // Add content-type for POST requests
      if (options.method === 'POST' && options.body) {
        if (!requestOptions.headers['Content-Type']) {
          requestOptions.headers['Content-Type'] = 'application/json';
        }
      }

      const req = https.request(requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve({ data: parsedData, status: res.statusCode, headers: res.headers });
          } catch (error) {
            // If response is not JSON, return raw data
            resolve({ data: data, status: res.statusCode, headers: res.headers, raw: true });
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      // Write body for POST requests
      if (options.method === 'POST' && options.body) {
        req.write(options.body);
      }

      req.end();
    } catch (error) {
      reject(new Error(`Invalid URL: ${error.message}`));
    }
  });
};

/**
 * Call Restream API endpoint with access token
 * @param {string} endpoint - API endpoint (e.g., '/v2/profile')
 * @param {string} accessToken - Access token
 * @param {Object} options - Request options (method, body)
 * @returns {Promise<Object>} API response
 */
const callRestreamAPI = async (endpoint, accessToken, options = {}) => {
  try {
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Access token is required');
    }

    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('API endpoint is required');
    }

    // Ensure endpoint starts with /
    const apiEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${RESTREAM_API_BASE_URL}${apiEndpoint}`;

    logger.info('Calling Restream API', { endpoint: apiEndpoint, method: options.method || 'GET' });

    const response = await makeHttpRequest(url, {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        status: response.status,
        data: response.data,
        fullResponse: response
      };
    } else {
      logger.error('Restream API error', { status: response.status, endpoint, data: response.data });
      return {
        success: false,
        status: response.status,
        message: response.data?.message || 'API call failed',
        data: response.data
      };
    }
  } catch (error) {
    logger.error('Error calling Restream API', { error: error.message, endpoint });
    throw new Error(`API call failed: ${error.message}`);
  }
};

/**
 * Get user profile from Restream API
 * @param {string} accessToken - Access token
 * @returns {Promise<Object>} User profile data
 */
const getUserProfile = async (accessToken) => {
  return await callRestreamAPI('/v2/profile', accessToken);
};

module.exports = {
  getAuthorizationUrl,
  getAccessToken,
  callRestreamAPI,
  getUserProfile,
  RESTREAM_CLIENT_ID,
  RESTREAM_REDIRECT_URI
};
