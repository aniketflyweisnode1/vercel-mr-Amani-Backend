/**
 * MealMe.ai API utility
 * Handles MealMe.ai API calls including store search and order creation
 */

const https = require('https');
const { URL } = require('url');
const logger = require('./logger');

// MealMe.ai API configuration
const MEALME_API_KEY = 'sk_live_hif0QChRlbCPJeNi_Ox-h409SQMudRw-MRboouA';
const MEALME_BASE_URL = 'https://api.mealme.ai';

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
          'Id-Token': MEALME_API_KEY,
          'accept': 'application/json',
          'User-Agent': 'Node.js MealMe.ai API Client',
          ...options.headers
        }
      };

      // Add content-type for POST requests
      if (options.method === 'POST' && options.body) {
        requestOptions.headers['content-type'] = 'application/json';
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
        req.write(JSON.stringify(options.body));
      }

      req.end();
    } catch (error) {
      reject(new Error(`Invalid URL: ${error.message}`));
    }
  });
};

/**
 * Search for stores by latitude and longitude
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} Store search result
 */
const searchStores = async (latitude, longitude) => {
  try {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('Latitude and longitude must be numbers');
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    const url = `${MEALME_BASE_URL}/search/store/v3?latitude=${latitude}&longitude=${longitude}`;

    logger.info('Searching MealMe stores', { latitude, longitude, url: url.replace(MEALME_API_KEY, '***') });

    const response = await makeHttpRequest(url, { method: 'GET' });

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        status: response.status,
        data: response.data,
        fullResponse: response
      };
    } else {
      logger.error('MealMe API error', { status: response.status, data: response.data });
      return {
        success: false,
        status: response.status,
        message: response.data?.message || 'Store search failed',
        data: response.data
      };
    }
  } catch (error) {
    logger.error('Error searching MealMe stores', { error: error.message, latitude, longitude });
    throw new Error(`Store search failed: ${error.message}`);
  }
};

/**
 * Create an order
 * @param {Object} orderData - Order data
 * @param {boolean} orderData.place_order - Whether to place the order
 * @param {Array} orderData.items - Array of order items
 * @param {string} orderData.items[].product_id - Product ID
 * @param {number} orderData.items[].quantity - Quantity
 * @returns {Promise<Object>} Order creation result
 */
const createOrder = async (orderData) => {
  try {
    if (!orderData || typeof orderData !== 'object') {
      throw new Error('Order data is required and must be an object');
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('Order items array is required and must not be empty');
    }

    // Validate items structure
    for (const item of orderData.items) {
      if (!item.product_id || typeof item.product_id !== 'string') {
        throw new Error('Each item must have a valid product_id (string)');
      }
      if (item.quantity === undefined || typeof item.quantity !== 'number' || item.quantity < 1) {
        throw new Error('Each item must have a valid quantity (number >= 1)');
      }
    }

    const url = `${MEALME_BASE_URL}/order/order/v2`;

    logger.info('Creating MealMe order', { 
      place_order: orderData.place_order, 
      itemsCount: orderData.items.length,
      url: url.replace(MEALME_API_KEY, '***')
    });

    const response = await makeHttpRequest(url, {
      method: 'POST',
      body: {
        place_order: orderData.place_order !== undefined ? orderData.place_order : false,
        items: orderData.items
      }
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        status: response.status,
        data: response.data,
        fullResponse: response
      };
    } else {
      logger.error('MealMe order creation error', { status: response.status, data: response.data });
      return {
        success: false,
        status: response.status,
        message: response.data?.message || 'Order creation failed',
        data: response.data
      };
    }
  } catch (error) {
    logger.error('Error creating MealMe order', { error: error.message, orderData });
    throw new Error(`Order creation failed: ${error.message}`);
  }
};

module.exports = {
  searchStores,
  createOrder,
  MEALME_API_KEY
};
