const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorReportAnIssue,
  getAllVendorReportAnIssue,
  getVendorReportAnIssueById,
  updateVendorReportAnIssue,
  deleteVendorReportAnIssue,
  getVendorReportAnIssueByType,
  getVendorReportAnIssueByAuth,
  getVendorReportAnIssueByStoreId
} = require('../../controllers/Vendor_ReportAnIssue.controller');
const {
  createVendorReportAnIssueSchema,
  updateVendorReportAnIssueSchema,
  getVendorReportAnIssueByIdSchema,
  getAllVendorReportAnIssueSchema,
  getVendorReportAnIssueByAuthSchema,
  getVendorReportAnIssueByTypeParamsSchema,
  getVendorReportAnIssueByTypeQuerySchema,
  getVendorReportAnIssueByStoreIdParamsSchema,
  getVendorReportAnIssueByStoreIdQuerySchema
} = require('../../../validators/Vendor_ReportAnIssue.validator');

router.post('/create', auth, validateBody(createVendorReportAnIssueSchema), createVendorReportAnIssue);

router.get('/getAll', validateQuery(getAllVendorReportAnIssueSchema), getAllVendorReportAnIssue);

router.get('/getById/:id', auth, validateParams(getVendorReportAnIssueByIdSchema), getVendorReportAnIssueById);

router.put('/update/:id', auth, validateParams(getVendorReportAnIssueByIdSchema), validateBody(updateVendorReportAnIssueSchema), updateVendorReportAnIssue);

router.delete('/delete/:id', auth, validateParams(getVendorReportAnIssueByIdSchema), deleteVendorReportAnIssue);

router.get('/getByType/:TypeIssue', auth, validateParams(getVendorReportAnIssueByTypeParamsSchema), validateQuery(getVendorReportAnIssueByTypeQuerySchema), getVendorReportAnIssueByType);

router.get('/getByAuth', auth, validateQuery(getVendorReportAnIssueByAuthSchema), getVendorReportAnIssueByAuth);

router.get('/getByStoreId/:Vendor_Store_id', auth, validateParams(getVendorReportAnIssueByStoreIdParamsSchema), validateQuery(getVendorReportAnIssueByStoreIdQuerySchema), getVendorReportAnIssueByStoreId);

module.exports = router;


