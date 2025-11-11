const express = require('express');
const router = express.Router();

const { createBank, getAllBanks, getBankById, updateBank, deleteBank } = require('../../controllers/Bank.controller');
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createBankSchema, updateBankSchema, getBankByIdSchema, getAllBanksSchema } = require('../../../validators/Bank.validator');

router.post('/create', auth, validateBody(createBankSchema), createBank);
router.get('/getAll', validateQuery(getAllBanksSchema), getAllBanks);
router.get('/getById/:id', auth, validateParams(getBankByIdSchema), getBankById);
router.put('/update/:id', auth, validateParams(getBankByIdSchema), validateBody(updateBankSchema), updateBank);
router.delete('/delete/:id', auth, validateParams(getBankByIdSchema), deleteBank);

module.exports = router;
