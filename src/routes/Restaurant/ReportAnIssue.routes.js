const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createReportAnIssue,
  getAllReportAnIssue,
  getReportAnIssueById,
  updateReportAnIssue,
  deleteReportAnIssue,
  getReportAnIssueByType,
  getReportAnIssueByAuth,
  getReportAnIssueByBranchId
} = require('../../controllers/ReportAnIssue.controller');
const {
  createReportAnIssueSchema,
  updateReportAnIssueSchema,
  getReportAnIssueByIdSchema,
  getAllReportAnIssueSchema,
  getReportAnIssueByAuthSchema,
  getReportAnIssueByTypeParamsSchema,
  getReportAnIssueByTypeQuerySchema,
  getReportAnIssueByBranchIdParamsSchema,
  getReportAnIssueByBranchIdQuerySchema
} = require('../../../validators/ReportAnIssue.validator');

router.post('/create', auth, validateBody(createReportAnIssueSchema), createReportAnIssue);

router.get('/getAll', validateQuery(getAllReportAnIssueSchema), getAllReportAnIssue);

router.get('/getById/:id', auth, validateParams(getReportAnIssueByIdSchema), getReportAnIssueById);

router.put('/update/:id', auth, validateParams(getReportAnIssueByIdSchema), validateBody(updateReportAnIssueSchema), updateReportAnIssue);

router.delete('/delete/:id', auth, validateParams(getReportAnIssueByIdSchema), deleteReportAnIssue);

router.get('/getByType/:TypeIssue', auth, validateParams(getReportAnIssueByTypeParamsSchema), validateQuery(getReportAnIssueByTypeQuerySchema), getReportAnIssueByType);

router.get('/getByAuth', auth, validateQuery(getReportAnIssueByAuthSchema), getReportAnIssueByAuth);

router.get('/getByBranchId/:Branch_id', auth, validateParams(getReportAnIssueByBranchIdParamsSchema), validateQuery(getReportAnIssueByBranchIdQuerySchema), getReportAnIssueByBranchId);

module.exports = router;

