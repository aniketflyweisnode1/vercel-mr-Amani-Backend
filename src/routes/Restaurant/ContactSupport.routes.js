const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createContactSupport,
  getAllContactSupport,
  getContactSupportById,
  updateContactSupport,
  deleteContactSupport,
  getContactSupportByAuth,
  getContactSupportByBranchId
} = require('../../controllers/ContactSupport.controller');
const {
  createContactSupportSchema,
  updateContactSupportSchema,
  getContactSupportByIdSchema,
  getAllContactSupportSchema,
  getContactSupportByAuthSchema,
  getContactSupportByBranchIdParamsSchema,
  getContactSupportByBranchIdQuerySchema
} = require('../../../validators/ContactSupport.validator');

router.post('/create', auth, validateBody(createContactSupportSchema), createContactSupport);
router.get('/getAll', validateQuery(getAllContactSupportSchema), getAllContactSupport);
router.get('/getById/:id', auth, validateParams(getContactSupportByIdSchema), getContactSupportById);
router.put('/update/:id', auth, validateParams(getContactSupportByIdSchema), validateBody(updateContactSupportSchema), updateContactSupport);
router.delete('/delete/:id', auth, validateParams(getContactSupportByIdSchema), deleteContactSupport);
router.get('/getByAuth', auth, validateQuery(getContactSupportByAuthSchema), getContactSupportByAuth);
router.get('/getByBranchId/:Branch_id', auth, validateParams(getContactSupportByBranchIdParamsSchema), validateQuery(getContactSupportByBranchIdQuerySchema), getContactSupportByBranchId);

module.exports = router;

