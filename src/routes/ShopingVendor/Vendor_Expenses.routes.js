const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorExpenses,
  getAllVendorExpenses,
  getVendorExpensesById,
  updateVendorExpenses,
  deleteVendorExpenses,
  getVendorExpensesByTypeId,
  getVendorExpensesByAuth,
  getVendorExpensesByCategoryId,
  getVendorExpensesByDate
} = require('../../controllers/Vendor_Expenses.controller');
const {
  createVendorExpensesSchema,
  updateVendorExpensesSchema,
  getVendorExpensesByIdSchema,
  getAllVendorExpensesSchema,
  getVendorExpensesByTypeIdParamsSchema,
  getVendorExpensesByTypeIdQuerySchema,
  getVendorExpensesByAuthSchema,
  getVendorExpensesByCategoryIdParamsSchema,
  getVendorExpensesByCategoryIdQuerySchema,
  getVendorExpensesByDateQuerySchema
} = require('../../../validators/Vendor_Expenses.validator');

router.post('/create', auth, validateBody(createVendorExpensesSchema), createVendorExpenses);
router.get('/getAll', validateQuery(getAllVendorExpensesSchema), getAllVendorExpenses);
router.get('/getById/:id', auth, validateParams(getVendorExpensesByIdSchema), getVendorExpensesById);
router.put('/update/:id', auth, validateParams(getVendorExpensesByIdSchema), validateBody(updateVendorExpensesSchema), updateVendorExpenses);
router.delete('/delete/:id', auth, validateParams(getVendorExpensesByIdSchema), deleteVendorExpenses);
router.get('/getByTypeId/:Type_id', validateParams(getVendorExpensesByTypeIdParamsSchema), validateQuery(getVendorExpensesByTypeIdQuerySchema), getVendorExpensesByTypeId);
router.get('/getByAuth', auth, validateQuery(getVendorExpensesByAuthSchema), getVendorExpensesByAuth);
router.get('/getByCategoryId/:Category_id', validateParams(getVendorExpensesByCategoryIdParamsSchema), validateQuery(getVendorExpensesByCategoryIdQuerySchema), getVendorExpensesByCategoryId);
router.get('/getByDate', validateQuery(getVendorExpensesByDateQuerySchema), getVendorExpensesByDate);

module.exports = router;

