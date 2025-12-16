const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { searchStores, createOrder } = require('../../utils/mealMe');

/**
 * Search for stores by coordinates
 * @route   GET /api/v2/mealme/search-stores
 * @access  Public
 */
const searchStoresByLocation = asyncHandler(async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (latitude === undefined || longitude === undefined) {
      return sendError(res, 'Latitude and longitude are required', 400);
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return sendError(res, 'Latitude and longitude must be valid numbers', 400);
    }

    const result = await searchStores(lat, lng);

    if (result.success) {
      return sendSuccess(res, result.data, 'Stores retrieved successfully', 200);
    } else {
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
      return sendError(res, result.message || 'Failed to create order', result.status || 400);
    }
  } catch (error) {
    console.error('Error in create order controller', { error: error.message });
    return sendError(res, error.message || 'Failed to create order', 500);
  }
});

module.exports = {
  searchStoresByLocation,
  createMealMeOrder
};
