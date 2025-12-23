const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateParams, validateQuery } = require('../../../middleware/validation');
const {
  getAccountingById,
  getAllAccounting,
  deleteAccounting,
  getAccountingByBranchId,
  getAccountingByAuth
} = require('../../controllers/Accounting.controller');
const {
  getAccountingByIdSchema,
  getAllAccountingSchema,
  deleteAccountingSchema,
  getAccountingByBranchIdParamsSchema,
  getAccountingByBranchIdQuerySchema,
  getAccountingByAuthSchema
} = require('../../../validators/Accounting.validator');

router.get('/getById/:id', auth, validateParams(getAccountingByIdSchema), validateQuery(getAccountingByBranchIdQuerySchema), getAccountingById);
router.get('/getAll', validateQuery(getAllAccountingSchema), getAllAccounting);
router.delete('/delete/:id', auth, validateParams(deleteAccountingSchema), deleteAccounting);
router.get('/getByBranchId/:Branch_id', auth, validateParams(getAccountingByBranchIdParamsSchema), validateQuery(getAccountingByBranchIdQuerySchema), getAccountingByBranchId);
router.get('/getByAuth', auth, validateQuery(getAccountingByAuthSchema), getAccountingByAuth);

module.exports = router;