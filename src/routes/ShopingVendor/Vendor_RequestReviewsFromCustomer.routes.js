const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorRequestReviewsFromCustomer,
  getAllVendorRequestReviewsFromCustomer,
  getVendorRequestReviewsFromCustomerById,
  updateVendorRequestReviewsFromCustomer,
  deleteVendorRequestReviewsFromCustomer,
  getVendorRequestReviewsFromCustomerByAuth
} = require('../../controllers/Vendor_RequestReviewsFromCustomer.controller');
const {
  createVendorRequestReviewsFromCustomerSchema,
  updateVendorRequestReviewsFromCustomerSchema,
  getVendorRequestReviewsFromCustomerByIdSchema,
  getAllVendorRequestReviewsFromCustomerSchema,
  getVendorRequestReviewsFromCustomerByAuthSchema
} = require('../../../validators/Vendor_RequestReviewsFromCustomer.validator');

router.post('/create', auth, validateBody(createVendorRequestReviewsFromCustomerSchema), createVendorRequestReviewsFromCustomer);

router.get('/getAll', validateQuery(getAllVendorRequestReviewsFromCustomerSchema), getAllVendorRequestReviewsFromCustomer);

router.get('/getById/:id', auth, validateParams(getVendorRequestReviewsFromCustomerByIdSchema), getVendorRequestReviewsFromCustomerById);

router.put('/update/:id', auth, validateParams(getVendorRequestReviewsFromCustomerByIdSchema), validateBody(updateVendorRequestReviewsFromCustomerSchema), updateVendorRequestReviewsFromCustomer);

router.delete('/delete/:id', auth, validateParams(getVendorRequestReviewsFromCustomerByIdSchema), deleteVendorRequestReviewsFromCustomer);

router.get('/getByAuth', auth, validateQuery(getVendorRequestReviewsFromCustomerByAuthSchema), getVendorRequestReviewsFromCustomerByAuth);

module.exports = router;

