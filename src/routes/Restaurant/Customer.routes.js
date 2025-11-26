const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomersByAuth,
  getCustomersByServiceId,
  getCustomersByBranchId
} = require('../../controllers/Customer.controller');
const {
  createCustomerSchema,
  updateCustomerSchema,
  getCustomerByIdSchema,
  getAllCustomersSchema,
  getCustomersByAuthSchema,
  getCustomersByServiceIdSchema,
  getCustomersByServiceIdQuerySchema,
  getCustomersByBranchIdSchema,
  getCustomersByBranchIdQuerySchema
} = require('../../../validators/Customer.validator');

/**
 * @route   POST /api/Customer/create
 * @desc    Create a new customer
 * @access  Private (Auth required)
 */
router.post('/create', auth, validateBody(createCustomerSchema), createCustomer);

/**
 * @route   GET /api/Customer/getAll
 * @desc    Get all customers with pagination and filtering
 * @access  Public
 */
router.get('/getAll', validateQuery(getAllCustomersSchema), getAllCustomers);

/**
 * @route   GET /api/Customer/getById/:id
 * @desc    Get customer by ID
 * @access  Private (Auth required)
 */
router.get('/getById/:id', auth, validateParams(getCustomerByIdSchema), getCustomerById);

/**
 * @route   PUT /api/Customer/update/:id
 * @desc    Update customer by ID
 * @access  Private (Auth required)
 */
router.put('/update/:id', auth, validateParams(getCustomerByIdSchema), validateBody(updateCustomerSchema), updateCustomer);

/**
 * @route   DELETE /api/Customer/delete/:id
 * @desc    Delete customer by ID (soft delete)
 * @access  Private (Auth required)
 */
router.delete('/delete/:id', auth, validateParams(getCustomerByIdSchema), deleteCustomer);

/**
 * @route   GET /api/Customer/getByAuth
 * @desc    Get customers created by authenticated user
 * @access  Private (Auth required)
 */
router.get('/getByAuth', auth, validateQuery(getCustomersByAuthSchema), getCustomersByAuth);

/**
 * @route   GET /api/Customer/getByServiceId/:service_id
 * @desc    Get customers by service ID
 * @access  Private (Auth required)
 */
router.get('/getByServiceId/:service_id', auth, validateParams(getCustomersByServiceIdSchema), validateQuery(getCustomersByServiceIdQuerySchema), getCustomersByServiceId);

/**
 * @route   GET /api/Customer/getByBranchId/:Branch_id
 * @desc    Get customers by branch ID
 * @access  Private (Auth required)
 */
router.get('/getByBranchId/:Branch_id', auth, validateParams(getCustomersByBranchIdSchema), validateQuery(getCustomersByBranchIdQuerySchema), getCustomersByBranchId);

module.exports = router;

