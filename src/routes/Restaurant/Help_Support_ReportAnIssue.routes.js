const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createHelpSupportReportAnIssue,
  getAllHelpSupportReportAnIssues,
  getHelpSupportReportAnIssueById,
  updateHelpSupportReportAnIssue,
  deleteHelpSupportReportAnIssue,
  getHelpSupportReportAnIssuesByIssueTypeId,
  getHelpSupportReportAnIssuesByBranchId,
  getHelpSupportReportAnIssuesByAuth
} = require('../../controllers/Help_Support_ReportAnIssue.controller');
const {
  createHelpSupportReportAnIssueSchema,
  updateHelpSupportReportAnIssueSchema,
  getHelpSupportReportAnIssueByIdSchema,
  getAllHelpSupportReportAnIssuesSchema,
  getHelpSupportReportAnIssuesByIssueTypeIdParamsSchema,
  getHelpSupportReportAnIssuesByIssueTypeIdQuerySchema,
  getHelpSupportReportAnIssuesByBranchIdParamsSchema,
  getHelpSupportReportAnIssuesByBranchIdQuerySchema,
  getHelpSupportReportAnIssuesByAuthSchema
} = require('../../../validators/Help_Support_ReportAnIssue.validator');

router.post('/create', auth, validateBody(createHelpSupportReportAnIssueSchema), createHelpSupportReportAnIssue);
router.get('/getAll', validateQuery(getAllHelpSupportReportAnIssuesSchema), getAllHelpSupportReportAnIssues);
router.get('/getById/:id', auth, validateParams(getHelpSupportReportAnIssueByIdSchema), getHelpSupportReportAnIssueById);
router.put('/update/:id', auth, validateParams(getHelpSupportReportAnIssueByIdSchema), validateBody(updateHelpSupportReportAnIssueSchema), updateHelpSupportReportAnIssue);
router.delete('/delete/:id', auth, validateParams(getHelpSupportReportAnIssueByIdSchema), deleteHelpSupportReportAnIssue);
router.get('/getByIssueTypeId/:Issue_type_id', validateParams(getHelpSupportReportAnIssuesByIssueTypeIdParamsSchema), validateQuery(getHelpSupportReportAnIssuesByIssueTypeIdQuerySchema), getHelpSupportReportAnIssuesByIssueTypeId);
router.get('/getByBranchId/:Branch_Id', validateParams(getHelpSupportReportAnIssuesByBranchIdParamsSchema), validateQuery(getHelpSupportReportAnIssuesByBranchIdQuerySchema), getHelpSupportReportAnIssuesByBranchId);
router.get('/getByAuth', auth, validateQuery(getHelpSupportReportAnIssuesByAuthSchema), getHelpSupportReportAnIssuesByAuth);

module.exports = router;

