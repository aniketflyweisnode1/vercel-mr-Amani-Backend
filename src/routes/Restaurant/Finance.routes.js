const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateParams, validateQuery } = require('../../../middleware/validation');
const { getFinanceByBranchId } = require('../../controllers/Finance.controller');
const {
  getFinanceByBranchIdParamsSchema,
  financeQuerySchema
} = require('../../../validators/Finance.validator');

router.get('/getByBranchId/:Branch_id', auth, validateParams(getFinanceByBranchIdParamsSchema), validateQuery(financeQuerySchema), getFinanceByBranchId);

module.exports = router;


