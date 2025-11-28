const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorBank,
  getAllVendorBanks,
  getVendorBankById,
  updateVendorBank,
  deleteVendorBank,
  getVendorBanksByAuth
} = require('../../controllers/Vendor_Bank.controller');
const {
  createVendorBankSchema,
  updateVendorBankSchema,
  getVendorBankByIdSchema,
  getAllVendorBanksSchema,
  getVendorBanksByAuthSchema
} = require('../../../validators/Vendor_Bank.validator');

router.post('/create', auth, validateBody(createVendorBankSchema), createVendorBank);
router.get('/getAll', validateQuery(getAllVendorBanksSchema), getAllVendorBanks);
router.get('/getById/:id', auth, validateParams(getVendorBankByIdSchema), getVendorBankById);
router.put('/update/:id', auth, validateParams(getVendorBankByIdSchema), validateBody(updateVendorBankSchema), updateVendorBank);
router.delete('/delete/:id', auth, validateParams(getVendorBankByIdSchema), deleteVendorBank);
router.get('/getByAuth', auth, validateQuery(getVendorBanksByAuthSchema), getVendorBanksByAuth);

module.exports = router;

