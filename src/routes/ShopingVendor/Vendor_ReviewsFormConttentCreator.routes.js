const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorReviewsFormConttentCreator,
  getAllVendorReviewsFormConttentCreator,
  getVendorReviewsFormConttentCreatorById,
  updateVendorReviewsFormConttentCreator,
  deleteVendorReviewsFormConttentCreator,
  getVendorReviewsFormConttentCreatorByAuth
} = require('../../controllers/Vendor_ReviewsFormConttentCreator.controller');
const {
  createVendorReviewsFormConttentCreatorSchema,
  updateVendorReviewsFormConttentCreatorSchema,
  getVendorReviewsFormConttentCreatorByIdSchema,
  getAllVendorReviewsFormConttentCreatorSchema,
  getVendorReviewsFormConttentCreatorByAuthSchema
} = require('../../../validators/Vendor_ReviewsFormConttentCreator.validator');

router.post('/create', auth, validateBody(createVendorReviewsFormConttentCreatorSchema), createVendorReviewsFormConttentCreator);

router.get('/getAll', validateQuery(getAllVendorReviewsFormConttentCreatorSchema), getAllVendorReviewsFormConttentCreator);

router.get('/getById/:id', auth, validateParams(getVendorReviewsFormConttentCreatorByIdSchema), getVendorReviewsFormConttentCreatorById);

router.put('/update/:id', auth, validateParams(getVendorReviewsFormConttentCreatorByIdSchema), validateBody(updateVendorReviewsFormConttentCreatorSchema), updateVendorReviewsFormConttentCreator);

router.delete('/delete/:id', auth, validateParams(getVendorReviewsFormConttentCreatorByIdSchema), deleteVendorReviewsFormConttentCreator);

router.get('/getByAuth', auth, validateQuery(getVendorReviewsFormConttentCreatorByAuthSchema), getVendorReviewsFormConttentCreatorByAuth);

module.exports = router;

