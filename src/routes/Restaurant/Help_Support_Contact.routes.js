const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createHelpSupportContact,
  getAllHelpSupportContacts,
  getHelpSupportContactById,
  updateHelpSupportContact,
  deleteHelpSupportContact,
  getHelpSupportContactsByBranchId,
  getHelpSupportContactsByAuth
} = require('../../controllers/Help_Support_Contact.controller');
const {
  createHelpSupportContactSchema,
  updateHelpSupportContactSchema,
  getHelpSupportContactByIdSchema,
  getAllHelpSupportContactsSchema,
  getHelpSupportContactsByBranchIdParamsSchema,
  getHelpSupportContactsByBranchIdQuerySchema,
  getHelpSupportContactsByAuthSchema
} = require('../../../validators/Help_Support_Contact.validator');

router.post('/create', auth, validateBody(createHelpSupportContactSchema), createHelpSupportContact);
router.get('/getAll', validateQuery(getAllHelpSupportContactsSchema), getAllHelpSupportContacts);
router.get('/getById/:id', auth, validateParams(getHelpSupportContactByIdSchema), getHelpSupportContactById);
router.put('/update/:id', auth, validateParams(getHelpSupportContactByIdSchema), validateBody(updateHelpSupportContactSchema), updateHelpSupportContact);
router.delete('/delete/:id', auth, validateParams(getHelpSupportContactByIdSchema), deleteHelpSupportContact);
router.get('/getByBranchId/:Branch_Id', validateParams(getHelpSupportContactsByBranchIdParamsSchema), validateQuery(getHelpSupportContactsByBranchIdQuerySchema), getHelpSupportContactsByBranchId);
router.get('/getByAuth', auth, validateQuery(getHelpSupportContactsByAuthSchema), getHelpSupportContactsByAuth);

module.exports = router;

