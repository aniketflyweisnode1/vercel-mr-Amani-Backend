/**
 * MealMe.ai API utility
 * Handles MealMe.ai API calls including store search and order creation
 */

const https = require('https');
const { URL } = require('url');
const logger = require('./logger');

// MealMe.ai (Satsuma) API configuration
const MEALME_API_KEY = 'sk_live_hif0QChRlbCPJeNi_Ox-h409SQMudRw-MRboouA';
const MEALME_BASE_URL = 'https://api.satsuma.ai';

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
          'Authorization': MEALME_API_KEY,
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
            // Check if response is HTML (indicates wrong endpoint or API issue)
            const contentType = res.headers['content-type'] || '';
            const isHtml = contentType.includes('text/html') || 
                          (data.trim().startsWith('<!DOCTYPE') || 
                           data.trim().startsWith('<!doctype') || 
                           data.trim().startsWith('<html'));
            
            if (isHtml) {
              // API returned HTML instead of JSON, likely wrong endpoint or API structure changed
              const errorMessage = res.statusCode === 404 
                ? 'API endpoint not found. The MealMe API endpoint may have changed or the endpoint path is incorrect.'
                : `API returned HTML response (status ${res.statusCode}). The endpoint may be incorrect or the API structure has changed.`;
              
              resolve({ 
                data: { 
                  error: errorMessage,
                  htmlResponse: true,
                  statusCode: res.statusCode 
                }, 
                status: res.statusCode, 
                headers: res.headers,
                isHtml: true,
                raw: true 
              });
              return;
            }
            
            const parsedData = JSON.parse(data);
            resolve({ data: parsedData, status: res.statusCode, headers: res.headers });
          } catch (error) {
            // If response is not JSON and not HTML, return raw data
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

    // Check if API returned HTML (wrong endpoint)
    if (response.isHtml) {
      const errorMsg = response.data?.error || 'MealMe API endpoint returned HTML instead of JSON. The endpoint may be incorrect.';
      logger.error('MealMe API endpoint error', { 
        status: response.status, 
        message: errorMsg,
        url: url.replace(MEALME_API_KEY, '***')
      });
      return {
        success: false,
        status: response.status,
        message: errorMsg,
        data: response.data,
        endpointIssue: true
      };
    }

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
        message: response.data?.message || response.data?.error || 'Store search failed',
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

    // Check if API returned HTML (wrong endpoint)
    if (response.isHtml) {
      const errorMsg = response.data?.error || 'MealMe API endpoint returned HTML instead of JSON. The endpoint may be incorrect.';
      logger.error('MealMe API endpoint error', { 
        status: response.status, 
        message: errorMsg,
        url: url.replace(MEALME_API_KEY, '***')
      });
      return {
        success: false,
        status: response.status,
        message: errorMsg,
        data: response.data,
        endpointIssue: true
      };
    }

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
        message: response.data?.message || response.data?.error || 'Order creation failed',
        data: response.data
      };
    }
  } catch (error) {
    logger.error('Error creating MealMe order', { error: error.message, orderData });
    throw new Error(`Order creation failed: ${error.message}`);
  }
};

/**
 * Search for products
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query string
 * @param {number} params.latitude - Latitude coordinate
 * @param {number} params.longitude - Longitude coordinate
 * @param {string} params.distance - Distance (e.g., "10mi", "5km")
 * @param {string} params.merchantId - Optional merchant ID
 * @param {string} params.category - Optional category filter
 * @returns {Promise<Object>} Product search result
 */
const searchProducts = async (params = {}) => {
  try {
    const { query, latitude, longitude, distance, merchantId, category } = params;

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    const queryParams = new URLSearchParams();
    if (query) queryParams.append('query', query);
    if (latitude) queryParams.append('latitude', latitude.toString());
    if (longitude) queryParams.append('longitude', longitude.toString());
    if (distance) queryParams.append('distance', distance);
    if (merchantId) queryParams.append('merchantId', merchantId);
    if (category) queryParams.append('category', category);

    const url = `${MEALME_BASE_URL}/product?${queryParams.toString()}`;

    logger.info('Searching products', { params, url: url.replace(MEALME_API_KEY, '***') });

    const response = await makeHttpRequest(url, { method: 'GET' });

    if (response.isHtml) {
      const errorMsg = response.data?.error || 'MealMe API endpoint returned HTML instead of JSON. The endpoint may be incorrect.';
      logger.error('MealMe API endpoint error', { status: response.status, message: errorMsg });
      return {
        success: false,
        status: response.status,
        message: errorMsg,
        data: response.data,
        endpointIssue: true
      };
    }

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        status: response.status,
        data: response.data,
        fullResponse: response
      };
    } else {
      logger.error('MealMe product search error', { status: response.status, data: response.data });
      return {
        success: false,
        status: response.status,
        message: response.data?.message || response.data?.error || 'Product search failed',
        data: response.data
      };
    }
  } catch (error) {
    logger.error('Error searching products', { error: error.message, params });
    throw new Error(`Product search failed: ${error.message}`);
  }
};

/**
 * Create a cart
 * @param {Object} cartData - Cart data
 * @param {string} cartData.location_id - Location ID
 * @param {string} cartData.user_id - User ID
 * @param {string} cartData.status - Cart status (default: "Active")
 * @returns {Promise<Object>} Cart creation result
 */
const createCart = async (cartData) => {
  try {
    if (!cartData || typeof cartData !== 'object') {
      throw new Error('Cart data is required and must be an object');
    }

    if (!cartData.location_id) {
      throw new Error('location_id is required');
    }

    if (!cartData.user_id) {
      throw new Error('user_id is required');
    }

    const url = `${MEALME_BASE_URL}/cart`;

    logger.info('Creating cart', { location_id: cartData.location_id, user_id: cartData.user_id });

    const response = await makeHttpRequest(url, {
      method: 'POST',
      body: {
        location_id: cartData.location_id,
        user_id: cartData.user_id,
        status: cartData.status || 'Active'
      }
    });

    if (response.isHtml) {
      const errorMsg = response.data?.error || 'MealMe API endpoint returned HTML instead of JSON. The endpoint may be incorrect.';
      logger.error('MealMe API endpoint error', { status: response.status, message: errorMsg });
      return {
        success: false,
        status: response.status,
        message: errorMsg,
        data: response.data,
        endpointIssue: true
      };
    }

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        status: response.status,
        data: response.data,
        fullResponse: response
      };
    } else {
      logger.error('MealMe cart creation error', { status: response.status, data: response.data });
      return {
        success: false,
        status: response.status,
        message: response.data?.message || response.data?.error || 'Cart creation failed',
        data: response.data
      };
    }
  } catch (error) {
    logger.error('Error creating cart', { error: error.message, cartData });
    throw new Error(`Cart creation failed: ${error.message}`);
  }
};

/**
 * Add items to cart
 * @param {string} cartId - Cart ID
 * @param {Object} itemData - Item data
 * @param {string} itemData.product_id - Product ID
 * @param {string} itemData.product_name - Product name
 * @param {number} itemData.quantity - Quantity
 * @returns {Promise<Object>} Add item result
 */
const addItemToCart = async (cartId, itemData) => {
  try {
    if (!cartId) {
      throw new Error('Cart ID is required');
    }

    if (!itemData || typeof itemData !== 'object') {
      throw new Error('Item data is required and must be an object');
    }

    if (!itemData.product_id) {
      throw new Error('product_id is required');
    }

    if (itemData.quantity === undefined || typeof itemData.quantity !== 'number' || itemData.quantity < 1) {
      throw new Error('quantity must be a number >= 1');
    }

    const url = `${MEALME_BASE_URL}/cart/${cartId}/item`;

    logger.info('Adding item to cart', { cartId, product_id: itemData.product_id, quantity: itemData.quantity });

    const response = await makeHttpRequest(url, {
      method: 'POST',
      body: {
        product_id: itemData.product_id,
        product_name: itemData.product_name,
        quantity: itemData.quantity
      }
    });

    if (response.isHtml) {
      const errorMsg = response.data?.error || 'MealMe API endpoint returned HTML instead of JSON. The endpoint may be incorrect.';
      logger.error('MealMe API endpoint error', { status: response.status, message: errorMsg });
      return {
        success: false,
        status: response.status,
        message: errorMsg,
        data: response.data,
        endpointIssue: true
      };
    }

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        status: response.status,
        data: response.data,
        fullResponse: response
      };
    } else {
      logger.error('MealMe add item to cart error', { status: response.status, data: response.data });
      return {
        success: false,
        status: response.status,
        message: response.data?.message || response.data?.error || 'Failed to add item to cart',
        data: response.data
      };
    }
  } catch (error) {
    logger.error('Error adding item to cart', { error: error.message, cartId, itemData });
    throw new Error(`Failed to add item to cart: ${error.message}`);
  }
};

/**
 * Update item quantity in cart
 * @param {string} cartId - Cart ID
 * @param {string} itemId - Item ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Update result
 */
const updateCartItem = async (cartId, itemId, quantity) => {
  try {
    if (!cartId) {
      throw new Error('Cart ID is required');
    }

    if (!itemId) {
      throw new Error('Item ID is required');
    }

    if (quantity === undefined || typeof quantity !== 'number' || quantity < 1) {
      throw new Error('quantity must be a number >= 1');
    }

    const url = `${MEALME_BASE_URL}/cart/${cartId}/item/${itemId}`;

    logger.info('Updating cart item', { cartId, itemId, quantity });

    const response = await makeHttpRequest(url, {
      method: 'PUT',
      body: { quantity }
    });

    if (response.isHtml) {
      const errorMsg = response.data?.error || 'MealMe API endpoint returned HTML instead of JSON. The endpoint may be incorrect.';
      logger.error('MealMe API endpoint error', { status: response.status, message: errorMsg });
      return {
        success: false,
        status: response.status,
        message: errorMsg,
        data: response.data,
        endpointIssue: true
      };
    }

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        status: response.status,
        data: response.data,
        fullResponse: response
      };
    } else {
      logger.error('MealMe update cart item error', { status: response.status, data: response.data });
      return {
        success: false,
        status: response.status,
        message: response.data?.message || response.data?.error || 'Failed to update cart item',
        data: response.data
      };
    }
  } catch (error) {
    logger.error('Error updating cart item', { error: error.message, cartId, itemId, quantity });
    throw new Error(`Failed to update cart item: ${error.message}`);
  }
};

/**
 * Create order (updated to match Satsuma API format)
 * @param {Object} orderData - Order data
 * @param {string} orderData.location_id - Location ID
 * @param {string} orderData.fulfillment_method - Fulfillment method (Delivery, Pickup, etc.)
 * @param {Object} orderData.customer - Customer information
 * @param {Array} orderData.items - Array of order items
 * @param {number} orderData.tip - Optional tip amount
 * @param {string} orderData.dropoff_instructions - Optional dropoff instructions
 * @returns {Promise<Object>} Order creation result
 */
const createOrderV2 = async (orderData) => {
  try {
    if (!orderData || typeof orderData !== 'object') {
      throw new Error('Order data is required and must be an object');
    }

    if (!orderData.location_id) {
      throw new Error('location_id is required');
    }

    if (!orderData.fulfillment_method) {
      throw new Error('fulfillment_method is required');
    }

    if (!orderData.customer || typeof orderData.customer !== 'object') {
      throw new Error('customer object is required');
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('items array is required and must not be empty');
    }

    // Validate items
    for (const item of orderData.items) {
      if (!item.product_id) {
        throw new Error('Each item must have a product_id');
      }
      if (item.quantity === undefined || typeof item.quantity !== 'number' || item.quantity < 1) {
        throw new Error('Each item must have a valid quantity (number >= 1)');
      }
    }

    const url = `${MEALME_BASE_URL}/order`;

    logger.info('Creating order', { 
      location_id: orderData.location_id,
      fulfillment_method: orderData.fulfillment_method,
      itemsCount: orderData.items.length
    });

    const response = await makeHttpRequest(url, {
      method: 'POST',
      body: orderData
    });

    if (response.isHtml) {
      const errorMsg = response.data?.error || 'MealMe API endpoint returned HTML instead of JSON. The endpoint may be incorrect.';
      logger.error('MealMe API endpoint error', { status: response.status, message: errorMsg });
      return {
        success: false,
        status: response.status,
        message: errorMsg,
        data: response.data,
        endpointIssue: true
      };
    }

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
        message: response.data?.message || response.data?.error || 'Order creation failed',
        data: response.data
      };
    }
  } catch (error) {
    logger.error('Error creating order', { error: error.message, orderData });
    throw new Error(`Order creation failed: ${error.message}`);
  }
};

/**
 * Get payment intent for order
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Payment intent result
 */
const getPaymentIntent = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const url = `${MEALME_BASE_URL}/order/${orderId}/payment-intent`;

    logger.info('Getting payment intent', { orderId });

    const response = await makeHttpRequest(url, { method: 'GET' });

    if (response.isHtml) {
      const errorMsg = response.data?.error || 'MealMe API endpoint returned HTML instead of JSON. The endpoint may be incorrect.';
      logger.error('MealMe API endpoint error', { status: response.status, message: errorMsg });
      return {
        success: false,
        status: response.status,
        message: errorMsg,
        data: response.data,
        endpointIssue: true
      };
    }

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        status: response.status,
        data: response.data,
        fullResponse: response
      };
    } else {
      logger.error('MealMe get payment intent error', { status: response.status, data: response.data });
      return {
        success: false,
        status: response.status,
        message: response.data?.message || response.data?.error || 'Failed to get payment intent',
        data: response.data
      };
    }
  } catch (error) {
    logger.error('Error getting payment intent', { error: error.message, orderId });
    throw new Error(`Failed to get payment intent: ${error.message}`);
  }
};

/**
 * Get payment link for order
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Payment link result
 */
const getPaymentLink = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const url = `${MEALME_BASE_URL}/order/${orderId}/payment-link`;

    logger.info('Getting payment link', { orderId });

    const response = await makeHttpRequest(url, { method: 'GET' });

    if (response.isHtml) {
      const errorMsg = response.data?.error || 'MealMe API endpoint returned HTML instead of JSON. The endpoint may be incorrect.';
      logger.error('MealMe API endpoint error', { status: response.status, message: errorMsg });
      return {
        success: false,
        status: response.status,
        message: errorMsg,
        data: response.data,
        endpointIssue: true
      };
    }

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        status: response.status,
        data: response.data,
        fullResponse: response
      };
    } else {
      logger.error('MealMe get payment link error', { status: response.status, data: response.data });
      return {
        success: false,
        status: response.status,
        message: response.data?.message || response.data?.error || 'Failed to get payment link',
        data: response.data
      };
    }
  } catch (error) {
    logger.error('Error getting payment link', { error: error.message, orderId });
    throw new Error(`Failed to get payment link: ${error.message}`);
  }
};

/**
 * Submit order with payment method
 * @param {string} orderId - Order ID
 * @param {string} paymentMethodId - Payment method ID
 * @returns {Promise<Object>} Submit order result
 */
const submitOrder = async (orderId, paymentMethodId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    if (!paymentMethodId) {
      throw new Error('payment_method_id is required');
    }

    const url = `${MEALME_BASE_URL}/order/${orderId}/submit`;

    logger.info('Submitting order', { orderId, paymentMethodId });

    const response = await makeHttpRequest(url, {
      method: 'POST',
      body: {
        payment_method_id: paymentMethodId
      }
    });

    if (response.isHtml) {
      const errorMsg = response.data?.error || 'MealMe API endpoint returned HTML instead of JSON. The endpoint may be incorrect.';
      logger.error('MealMe API endpoint error', { status: response.status, message: errorMsg });
      return {
        success: false,
        status: response.status,
        message: errorMsg,
        data: response.data,
        endpointIssue: true
      };
    }

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        status: response.status,
        data: response.data,
        fullResponse: response
      };
    } else {
      logger.error('MealMe submit order error', { status: response.status, data: response.data });
      return {
        success: false,
        status: response.status,
        message: response.data?.message || response.data?.error || 'Failed to submit order',
        data: response.data
      };
    }
  } catch (error) {
    logger.error('Error submitting order', { error: error.message, orderId, paymentMethodId });
    throw new Error(`Failed to submit order: ${error.message}`);
  }
};

module.exports = {
  searchStores,
  createOrder,
  searchProducts,
  createCart,
  addItemToCart,
  updateCartItem,
  createOrderV2,
  getPaymentIntent,
  getPaymentLink,
  submitOrder,
  MEALME_API_KEY
};
