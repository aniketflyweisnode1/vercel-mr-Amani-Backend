const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { 
  searchStores, 
  createOrder,
  searchProducts,
  createCart,
  addItemToCart,
  updateCartItem,
  createOrderV2,
  getPaymentIntent,
  getPaymentLink,
  submitOrder
} = require('../../utils/mealMe');

/**
 * Search for stores by coordinates
 * @route   GET /api/v2/mealme/search-stores
 * @access  Public
 */
const searchStoresByLocation = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
// console.log("===========================\n\n",latitude, longitude);
    if (latitude === undefined || longitude === undefined) {
      return sendError(res, 'Latitude and longitude are required', 400);
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return sendError(res, 'Latitude and longitude must be valid numbers', 400);
    }

    const result = await searchStores(lat, lng);
// console.log("===========================\n\n",result);
    if (result.success) {
      return sendSuccess(res, result.data, 'Stores retrieved successfully', 200);
    } else {
      // Handle endpoint issues with more specific error messages
      if (result.endpointIssue) {
        return sendError(
          res, 
          'MealMe API endpoint is not accessible. Please verify the API endpoint configuration or contact support.',
          503
        );
      }
      return sendError(res, result.message || 'Failed to search stores', result.status || 400);
    }
  } catch (error) {
    console.error('Error in search stores controller', { error: error.message });
    return sendError(res, error.message || 'Failed to search stores', 500);
  }
});

/**
 * Create an order
 * @route   POST /api/v2/mealme/create-order
 * @access  Public
 */
const createMealMeOrder = asyncHandler(async (req, res) => {
  try {
    const { place_order, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Items array is required and must not be empty', 400);
    }

    // Validate items structure
    for (const item of items) {
      if (!item.product_id || typeof item.product_id !== 'string') {
        return sendError(res, 'Each item must have a valid product_id (string)', 400);
      }
      if (item.quantity === undefined || typeof item.quantity !== 'number' || item.quantity < 1) {
        return sendError(res, 'Each item must have a valid quantity (number >= 1)', 400);
      }
    }

    const orderData = {
      place_order: place_order !== undefined ? place_order : false,
      items: items
    };

    const result = await createOrder(orderData);

    if (result.success) {
      return sendSuccess(res, result.data, 'Order created successfully', 201);
    } else {
      // Handle endpoint issues with more specific error messages
      if (result.endpointIssue) {
        return sendError(
          res, 
          'MealMe API endpoint is not accessible. Please verify the API endpoint configuration or contact support.',
          503
        );
      }
      return sendError(res, result.message || 'Failed to create order', result.status || 400);
    }
  } catch (error) {
    console.error('Error in create order controller', { error: error.message });
    return sendError(res, error.message || 'Failed to create order', 500);
  }
});

/**
 * Search for products
 * @route   GET /api/v2/mealme/search-products
 * @access  Public
 */
const searchProductsByQuery = asyncHandler(async (req, res) => {
  try {
    const { query, latitude, longitude, distance, merchantId, category } = req.query;

    if (!latitude || !longitude) {
      return sendError(res, 'Latitude and longitude are required', 400);
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return sendError(res, 'Latitude and longitude must be valid numbers', 400);
    }

    const result = await searchProducts({
      query,
      latitude: lat,
      longitude: lng,
      distance,
      merchantId,
      category
    });

    if (result.success) {
      return sendSuccess(res, result.data, 'Products retrieved successfully', 200);
    } else {
      if (result.endpointIssue) {
        return sendError(
          res,
          'MealMe API endpoint is not accessible. Please verify the API endpoint configuration or contact support.',
          503
        );
      }
      return sendError(res, result.message || 'Failed to search products', result.status || 400);
    }
  } catch (error) {
    console.error('Error in search products controller', { error: error.message });
    return sendError(res, error.message || 'Failed to search products', 500);
  }
});

/**
 * Create a cart
 * @route   POST /api/v2/mealme/cart
 * @access  Public
 */
const createMealMeCart = asyncHandler(async (req, res) => {
  try {
    const { location_id, user_id, status } = req.body;

    if (!location_id) {
      return sendError(res, 'location_id is required', 400);
    }

    if (!user_id) {
      return sendError(res, 'user_id is required', 400);
    }

    const result = await createCart({
      location_id,
      user_id,
      status: status || 'Active'
    });

    if (result.success) {
      return sendSuccess(res, result.data, 'Cart created successfully', 201);
    } else {
      if (result.endpointIssue) {
        return sendError(
          res,
          'MealMe API endpoint is not accessible. Please verify the API endpoint configuration or contact support.',
          503
        );
      }
      return sendError(res, result.message || 'Failed to create cart', result.status || 400);
    }
  } catch (error) {
    console.error('Error in create cart controller', { error: error.message });
    return sendError(res, error.message || 'Failed to create cart', 500);
  }
});

/**
 * Add item to cart
 * @route   POST /api/v2/mealme/cart/:cartId/item
 * @access  Public
 */
const addItemToMealMeCart = asyncHandler(async (req, res) => {
  try {
    const { cartId } = req.params;
    const { product_id, product_name, quantity } = req.body;

    if (!product_id) {
      return sendError(res, 'product_id is required', 400);
    }

    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
      return sendError(res, 'quantity must be a number >= 1', 400);
    }

    const result = await addItemToCart(cartId, {
      product_id,
      product_name,
      quantity
    });

    if (result.success) {
      return sendSuccess(res, result.data, 'Item added to cart successfully', 201);
    } else {
      if (result.endpointIssue) {
        return sendError(
          res,
          'MealMe API endpoint is not accessible. Please verify the API endpoint configuration or contact support.',
          503
        );
      }
      return sendError(res, result.message || 'Failed to add item to cart', result.status || 400);
    }
  } catch (error) {
    console.error('Error in add item to cart controller', { error: error.message });
    return sendError(res, error.message || 'Failed to add item to cart', 500);
  }
});

/**
 * Update item quantity in cart
 * @route   PUT /api/v2/mealme/cart/:cartId/item/:itemId
 * @access  Public
 */
const updateMealMeCartItem = asyncHandler(async (req, res) => {
  try {
    const { cartId, itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
      return sendError(res, 'quantity must be a number >= 1', 400);
    }

    const result = await updateCartItem(cartId, itemId, quantity);

    if (result.success) {
      return sendSuccess(res, result.data, 'Cart item updated successfully', 200);
    } else {
      if (result.endpointIssue) {
        return sendError(
          res,
          'MealMe API endpoint is not accessible. Please verify the API endpoint configuration or contact support.',
          503
        );
      }
      return sendError(res, result.message || 'Failed to update cart item', result.status || 400);
    }
  } catch (error) {
    console.error('Error in update cart item controller', { error: error.message });
    return sendError(res, error.message || 'Failed to update cart item', 500);
  }
});

/**
 * Create order (new format)
 * @route   POST /api/v2/mealme/order
 * @access  Public
 */
const createMealMeOrderV2 = asyncHandler(async (req, res) => {
  try {
    const { location_id, fulfillment_method, customer, items, tip, dropoff_instructions } = req.body;

    if (!location_id) {
      return sendError(res, 'location_id is required', 400);
    }

    if (!fulfillment_method) {
      return sendError(res, 'fulfillment_method is required', 400);
    }

    if (!customer || typeof customer !== 'object') {
      return sendError(res, 'customer object is required', 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'items array is required and must not be empty', 400);
    }

    const result = await createOrderV2({
      location_id,
      fulfillment_method,
      customer,
      items,
      tip,
      dropoff_instructions
    });

    if (result.success) {
      return sendSuccess(res, result.data, 'Order created successfully', 201);
    } else {
      if (result.endpointIssue) {
        return sendError(
          res,
          'MealMe API endpoint is not accessible. Please verify the API endpoint configuration or contact support.',
          503
        );
      }
      return sendError(res, result.message || 'Failed to create order', result.status || 400);
    }
  } catch (error) {
    console.error('Error in create order controller', { error: error.message });
    return sendError(res, error.message || 'Failed to create order', 500);
  }
});

/**
 * Get payment intent for order
 * @route   GET /api/v2/mealme/order/:orderId/payment-intent
 * @access  Public
 */
const getMealMePaymentIntent = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return sendError(res, 'Order ID is required', 400);
    }

    const result = await getPaymentIntent(orderId);

    if (result.success) {
      return sendSuccess(res, result.data, 'Payment intent retrieved successfully', 200);
    } else {
      if (result.endpointIssue) {
        return sendError(
          res,
          'MealMe API endpoint is not accessible. Please verify the API endpoint configuration or contact support.',
          503
        );
      }
      return sendError(res, result.message || 'Failed to get payment intent', result.status || 400);
    }
  } catch (error) {
    console.error('Error in get payment intent controller', { error: error.message });
    return sendError(res, error.message || 'Failed to get payment intent', 500);
  }
});

/**
 * Get payment link for order
 * @route   GET /api/v2/mealme/order/:orderId/payment-link
 * @access  Public
 */
const getMealMePaymentLink = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return sendError(res, 'Order ID is required', 400);
    }

    const result = await getPaymentLink(orderId);

    if (result.success) {
      return sendSuccess(res, result.data, 'Payment link retrieved successfully', 200);
    } else {
      if (result.endpointIssue) {
        return sendError(
          res,
          'MealMe API endpoint is not accessible. Please verify the API endpoint configuration or contact support.',
          503
        );
      }
      return sendError(res, result.message || 'Failed to get payment link', result.status || 400);
    }
  } catch (error) {
    console.error('Error in get payment link controller', { error: error.message });
    return sendError(res, error.message || 'Failed to get payment link', 500);
  }
});

/**
 * Submit order with payment method
 * @route   POST /api/v2/mealme/order/:orderId/submit
 * @access  Public
 */
const submitMealMeOrder = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const { payment_method_id } = req.body;

    if (!orderId) {
      return sendError(res, 'Order ID is required', 400);
    }

    if (!payment_method_id) {
      return sendError(res, 'payment_method_id is required', 400);
    }

    const result = await submitOrder(orderId, payment_method_id);

    if (result.success) {
      return sendSuccess(res, result.data, 'Order submitted successfully', 200);
    } else {
      if (result.endpointIssue) {
        return sendError(
          res,
          'MealMe API endpoint is not accessible. Please verify the API endpoint configuration or contact support.',
          503
        );
      }
      return sendError(res, result.message || 'Failed to submit order', result.status || 400);
    }
  } catch (error) {
    console.error('Error in submit order controller', { error: error.message });
    return sendError(res, error.message || 'Failed to submit order', 500);
  }
});

module.exports = {
  searchStoresByLocation,
  createMealMeOrder,
  searchProductsByQuery,
  createMealMeCart,
  addItemToMealMeCart,
  updateMealMeCartItem,
  createMealMeOrderV2,
  getMealMePaymentIntent,
  getMealMePaymentLink,
  submitMealMeOrder
};
