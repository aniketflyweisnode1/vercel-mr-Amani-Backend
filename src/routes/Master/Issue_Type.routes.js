const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createIssueType,
  getAllIssueTypes,
  getIssueTypeById,
  updateIssueType,
  deleteIssueType,
  getIssueTypesByAuth
} = require('../../controllers/Issue_Type.controller');
const {
  createIssueTypeSchema,
  updateIssueTypeSchema,
  getIssueTypeByIdSchema,
  getAllIssueTypesSchema,
  getIssueTypesByAuthSchema
} = require('../../../validators/Issue_Type.validator');

router.post('/create', auth, validateBody(createIssueTypeSchema), createIssueType);
router.get('/getAll', validateQuery(getAllIssueTypesSchema), getAllIssueTypes);
router.get('/getById/:id', auth, validateParams(getIssueTypeByIdSchema), getIssueTypeById);
router.put('/update/:id', auth, validateParams(getIssueTypeByIdSchema), validateBody(updateIssueTypeSchema), updateIssueType);
router.delete('/delete/:id', auth, validateParams(getIssueTypeByIdSchema), deleteIssueType);
router.get('/getByAuth', auth, validateQuery(getIssueTypesByAuthSchema), getIssueTypesByAuth);

module.exports = router;

