const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpensesByAuth,
  getExpensesByBranchId
} = require('../../controllers/Expenses.controller');
const {
  createExpenseSchema,
  updateExpenseSchema,
  getExpenseByIdSchema,
  getAllExpensesSchema,
  getExpensesByAuthSchema,
  getExpensesByBranchIdParamsSchema,
  getExpensesByBranchIdQuerySchema
} = require('../../../validators/Expenses.validator');

router.post('/create', auth, validateBody(createExpenseSchema), createExpense);
router.get('/getAll', validateQuery(getAllExpensesSchema), getAllExpenses);
router.get('/getById/:id', auth, validateParams(getExpenseByIdSchema), getExpenseById);
router.put('/update/:id', auth, validateParams(getExpenseByIdSchema), validateBody(updateExpenseSchema), updateExpense);
router.delete('/delete/:id', auth, validateParams(getExpenseByIdSchema), deleteExpense);
router.get('/getByAuth', auth, validateQuery(getExpensesByAuthSchema), getExpensesByAuth);
router.get('/getByBranchId/:Branch_id', auth, validateParams(getExpensesByBranchIdParamsSchema), validateQuery(getExpensesByBranchIdQuerySchema), getExpensesByBranchId);

module.exports = router;


