const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createHelpSupportFaq,
  getAllHelpSupportFaqs,
  getHelpSupportFaqById,
  updateHelpSupportFaq,
  deleteHelpSupportFaq,
  getHelpSupportFaqsByType,
  getHelpSupportFaqsByBranchId,
  getHelpSupportFaqsByAuth
} = require('../../controllers/Help_Support_Faq.controller');
const {
  createHelpSupportFaqSchema,
  updateHelpSupportFaqSchema,
  getHelpSupportFaqByIdSchema,
  getAllHelpSupportFaqsSchema,
  getHelpSupportFaqsByTypeParamsSchema,
  getHelpSupportFaqsByTypeQuerySchema,
  getHelpSupportFaqsByBranchIdParamsSchema,
  getHelpSupportFaqsByBranchIdQuerySchema,
  getHelpSupportFaqsByAuthSchema
} = require('../../../validators/Help_Support_Faq.validator');

router.post('/create', auth, validateBody(createHelpSupportFaqSchema), createHelpSupportFaq);
router.get('/getAll', validateQuery(getAllHelpSupportFaqsSchema), getAllHelpSupportFaqs);
router.get('/getById/:id', auth, validateParams(getHelpSupportFaqByIdSchema), getHelpSupportFaqById);
router.put('/update/:id', auth, validateParams(getHelpSupportFaqByIdSchema), validateBody(updateHelpSupportFaqSchema), updateHelpSupportFaq);
router.delete('/delete/:id', auth, validateParams(getHelpSupportFaqByIdSchema), deleteHelpSupportFaq);
router.get('/getByType/:type', validateParams(getHelpSupportFaqsByTypeParamsSchema), validateQuery(getHelpSupportFaqsByTypeQuerySchema), getHelpSupportFaqsByType);
router.get('/getByBranchId/:Branch_Id', validateParams(getHelpSupportFaqsByBranchIdParamsSchema), validateQuery(getHelpSupportFaqsByBranchIdQuerySchema), getHelpSupportFaqsByBranchId);
router.get('/getByAuth', auth, validateQuery(getHelpSupportFaqsByAuthSchema), getHelpSupportFaqsByAuth);

module.exports = router;

