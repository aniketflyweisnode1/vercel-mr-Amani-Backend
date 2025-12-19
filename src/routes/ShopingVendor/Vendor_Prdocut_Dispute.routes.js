const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorProductDispute,
  getAllVendorProductDispute,
  getVendorProductDisputeById,
  updateVendorProductDispute,
  deleteVendorProductDispute,
  getVendorProductDisputeByAuth
} = require('../../controllers/Vendor_Prdocut_Dispute.controller');
const {
  createVendorProductDisputeSchema,
  updateVendorProductDisputeSchema,
  getVendorProductDisputeByIdSchema,
  getAllVendorProductDisputeSchema,
  getVendorProductDisputeByAuthSchema
} = require('../../../validators/Vendor_Prdocut_Dispute.validator');

router.post('/create', auth, validateBody(createVendorProductDisputeSchema), createVendorProductDispute);

router.get('/getAll', validateQuery(getAllVendorProductDisputeSchema), getAllVendorProductDispute);

router.get('/getById/:id', auth, validateParams(getVendorProductDisputeByIdSchema), getVendorProductDisputeById);

router.put('/update/:id', auth, validateParams(getVendorProductDisputeByIdSchema), validateBody(updateVendorProductDisputeSchema), updateVendorProductDispute);

router.delete('/delete/:id', auth, validateParams(getVendorProductDisputeByIdSchema), deleteVendorProductDispute);

router.get('/getByAuth', auth, validateQuery(getVendorProductDisputeByAuthSchema), getVendorProductDisputeByAuth);

module.exports = router;

