/**
 * MealMe.ai (Satsuma) API Routes
 * 
 * Documentation: https://api.mealme.ai/documentation
 * Base URL: /api/v2/mealme
 * API Base: https://api.satsuma.ai
 * 
 * Available Endpoints:
 * - GET  /search-stores - Search for stores by latitude and longitude (legacy)
 * - POST /create-order  - Create a new order with items (legacy)
 * - GET  /search-products - Search for products by query and location
 * - POST /cart - Create a new cart
 * - POST /cart/:cartId/item - Add item to cart
 * - PUT  /cart/:cartId/item/:itemId - Update item quantity in cart
 * - POST /order - Create a new order (new format)
 * - GET  /order/:orderId/payment-intent - Get payment intent for order
 * - GET  /order/:orderId/payment-link - Get payment link for order
 * - POST /order/:orderId/submit - Submit order with payment method
 */

const express = require('express');
const router = express.Router();
const { validateQuery, validateBody, validateParams } = require('../../../middleware/validation');
const { 
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
} = require('../../controllers/MealMe.controller');
const { 
  searchStoresSchema, 
  createOrderSchema,
  searchProductsSchema,
  createCartSchema,
  addItemToCartSchema,
  updateCartItemSchema,
  createOrderV2Schema,
  submitOrderSchema,
  orderIdParamSchema,
  cartIdParamSchema,
  itemIdParamSchema,
  cartItemParamsSchema
} = require('../../../validators/MealMe.validator');

/**
 * @route   GET /api/v2/mealme/search-stores
 * @desc    Search for stores by location coordinates (legacy endpoint)
 * @access  Public
 * @query   {number} latitude - Latitude coordinate (-90 to 90)
 * @query   {number} longitude - Longitude coordinate (-180 to 180)
 */
router.get('/search-stores', validateQuery(searchStoresSchema), searchStoresByLocation);

/**
 * @route   GET /api/v2/mealme/search-products
 * @desc    Search for products by query and location
 * @access  Public
 * @query   {string} query - Search query string
 * @query   {number} latitude - Latitude coordinate (-90 to 90, required)
 * @query   {number} longitude - Longitude coordinate (-180 to 180, required)
 * @query   {string} distance - Distance (e.g., "10mi", "5km")
 * @query   {string} merchantId - Optional merchant ID
 * @query   {string} category - Optional category filter
 */
router.get('/search-products', validateQuery(searchProductsSchema), searchProductsByQuery);

/**
 * @route   POST /api/v2/mealme/cart
 * @desc    Create a new cart
 * @access  Public
 * @body    {string} location_id - Location ID (required)
 * @body    {string} user_id - User ID (required)
 * @body    {string} status - Cart status (optional, default: "Active")
 */
router.post('/cart', validateBody(createCartSchema), createMealMeCart);

/**
 * @route   POST /api/v2/mealme/cart/:cartId/item
 * @desc    Add item to cart
 * @access  Public
 * @param   {string} cartId - Cart ID
 * @body    {string} product_id - Product ID (required)
 * @body    {string} product_name - Product name (optional)
 * @body    {number} quantity - Quantity (required, >= 1)
 */
router.post('/cart/:cartId/item', validateParams(cartIdParamSchema), validateBody(addItemToCartSchema), addItemToMealMeCart);

/**
 * @route   PUT /api/v2/mealme/cart/:cartId/item/:itemId
 * @desc    Update item quantity in cart
 * @access  Public
 * @param   {string} cartId - Cart ID
 * @param   {string} itemId - Item ID
 * @body    {number} quantity - New quantity (required, >= 1)
 */
router.put('/cart/:cartId/item/:itemId', validateParams(cartItemParamsSchema), validateBody(updateCartItemSchema), updateMealMeCartItem);

/**
 * @route   POST /api/v2/mealme/create-order
 * @desc    Create a new order with items (legacy format)
 * @access  Public
 * @body    {boolean} place_order - Whether to place the order immediately
 * @body    {Array} items - Array of order items
 * @body    {string} items[].product_id - Product ID (required)
 * @body    {number} items[].quantity - Quantity (required, >= 1)
 */
router.post('/create-order', validateBody(createOrderSchema), createMealMeOrder);

/**
 * @route   POST /api/v2/mealme/order
 * @desc    Create a new order (new format with customer details)
 * @access  Public
 * @body    {string} location_id - Location ID (required)
 * @body    {string} fulfillment_method - Fulfillment method (required)
 * @body    {Object} customer - Customer information (required)
 * @body    {string} customer.id - Customer ID (required)
 * @body    {string} customer.name - Customer name (optional)
 * @body    {string} customer.email - Customer email (optional)
 * @body    {string} customer.phone_number - Customer phone number (optional)
 * @body    {Object} customer.address - Customer address (optional)
 * @body    {Array} items - Array of order items (required)
 * @body    {string} items[].product_id - Product ID (required)
 * @body    {number} items[].quantity - Quantity (required, >= 1)
 * @body    {number} tip - Optional tip amount
 * @body    {string} dropoff_instructions - Optional dropoff instructions
 */
router.post('/order', validateBody(createOrderV2Schema), createMealMeOrderV2);

/**
 * @route   GET /api/v2/mealme/order/:orderId/payment-intent
 * @desc    Get payment intent for order
 * @access  Public
 * @param   {string} orderId - Order ID
 */
router.get('/order/:orderId/payment-intent', validateParams(orderIdParamSchema), getMealMePaymentIntent);

/**
 * @route   GET /api/v2/mealme/order/:orderId/payment-link
 * @desc    Get payment link for order
 * @access  Public
 * @param   {string} orderId - Order ID
 */
router.get('/order/:orderId/payment-link', validateParams(orderIdParamSchema), getMealMePaymentLink);

/**
 * @route   POST /api/v2/mealme/order/:orderId/submit
 * @desc    Submit order with payment method
 * @access  Public
 * @param   {string} orderId - Order ID
 * @body    {string} payment_method_id - Payment method ID (required)
 */
router.post('/order/:orderId/submit', validateParams(orderIdParamSchema), validateBody(submitOrderSchema), submitMealMeOrder);

module.exports = router;
