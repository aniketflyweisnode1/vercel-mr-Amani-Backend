const express = require('express');
const router = express.Router();

const { createTransaction, getAllTransactions, getTransactionById, updateTransaction, deleteTransaction, getTransactionsByAuth } = require('../../controllers/transaction.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { createTransactionSchema, updateTransactionSchema, getTransactionByIdSchema, getAllTransactionsSchema, getTransactionsByAuthSchema } = require('../../../validators/transaction.validator');

router.post('/create', auth, validateBody(createTransactionSchema), createTransaction);
router.get('/getAll', validateQuery(getAllTransactionsSchema), getAllTransactions);
router.get('/getById/:id', auth, validateParams(getTransactionByIdSchema), getTransactionById);
router.put('/update/:id', auth, validateParams(getTransactionByIdSchema), validateBody(updateTransactionSchema), updateTransaction);
router.delete('/delete/:id', auth, validateParams(getTransactionByIdSchema), deleteTransaction);
router.get('/getByAuth', auth, validateQuery(getTransactionsByAuthSchema), getTransactionsByAuth);

module.exports = router;

