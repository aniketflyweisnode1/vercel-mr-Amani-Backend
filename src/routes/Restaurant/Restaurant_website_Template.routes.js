const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  getTemplatesByAuth
} = require('../../controllers/Restaurant_website_Template.controller');
const {
  createTemplateSchema,
  updateTemplateSchema,
  getTemplateByIdSchema,
  getAllTemplatesSchema,
  getTemplatesByAuthSchema
} = require('../../../validators/Restaurant_website_Template.validator');

router.post('/create', auth, validateBody(createTemplateSchema), createTemplate);
router.get('/getAll', validateQuery(getAllTemplatesSchema), getAllTemplates);
router.get('/getById/:id', auth, validateParams(getTemplateByIdSchema), getTemplateById);
router.put('/update/:id', auth, validateParams(getTemplateByIdSchema), validateBody(updateTemplateSchema), updateTemplate);
router.delete('/delete/:id', auth, validateParams(getTemplateByIdSchema), deleteTemplate);
router.get('/getByAuth', auth, validateQuery(getTemplatesByAuthSchema), getTemplatesByAuth);

module.exports = router;


