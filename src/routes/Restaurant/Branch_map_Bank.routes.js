const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createBranchMapBank,
  getAllBranchMapBanks,
  getBranchMapBankById,
  updateBranchMapBank,
  deleteBranchMapBank,
  getBranchMapBankByAuth,
  getBranchMapBankByBranchId
} = require('../../controllers/Branch_map_Bank.controller');
const {
  createBranchMapBankSchema,
  updateBranchMapBankSchema,
  getBranchMapBankByIdSchema,
  getAllBranchMapBankSchema,
  getBranchMapBankByAuthSchema,
  getBranchMapBankByBranchIdParamsSchema,
  getBranchMapBankByBranchIdQuerySchema
} = require('../../../validators/Branch_map_Bank.validator');


router.post('/create', auth, validateBody(createBranchMapBankSchema), createBranchMapBank);
router.get('/getAll', validateQuery(getAllBranchMapBankSchema), getAllBranchMapBanks);
router.get('/getById/:id', auth, validateParams(getBranchMapBankByIdSchema), getBranchMapBankById);

router.put('/update/:id', auth, validateParams(getBranchMapBankByIdSchema), validateBody(updateBranchMapBankSchema), updateBranchMapBank);
router.delete('/delete/:id', auth, validateParams(getBranchMapBankByIdSchema), deleteBranchMapBank);
router.get('/getByAuth', auth, validateQuery(getBranchMapBankByAuthSchema), getBranchMapBankByAuth);
router.get('/getByBranchId/:Branch_id', auth, validateParams(getBranchMapBankByBranchIdParamsSchema), validateQuery(getBranchMapBankByBranchIdQuerySchema), getBranchMapBankByBranchId);

module.exports = router;


