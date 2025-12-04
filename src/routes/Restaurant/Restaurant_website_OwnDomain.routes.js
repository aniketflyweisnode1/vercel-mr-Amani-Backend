const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createOwnDomain,
  getAllOwnDomains,
  getOwnDomainById,
  updateOwnDomain,
  deleteOwnDomain,
  getOwnDomainsByAuth
} = require('../../controllers/Restaurant_website_OwnDomain.controller');
const {
  createOwnDomainSchema,
  updateOwnDomainSchema,
  getOwnDomainByIdSchema,
  getAllOwnDomainsSchema,
  getOwnDomainsByAuthSchema
} = require('../../../validators/Restaurant_website_OwnDomain.validator');

router.post('/create', auth, validateBody(createOwnDomainSchema), createOwnDomain);
router.get('/getAll', validateQuery(getAllOwnDomainsSchema), getAllOwnDomains);
router.get('/getById/:id', auth, validateParams(getOwnDomainByIdSchema), getOwnDomainById);
router.put('/update/:id', auth, validateParams(getOwnDomainByIdSchema), validateBody(updateOwnDomainSchema), updateOwnDomain);
router.delete('/delete/:id', auth, validateParams(getOwnDomainByIdSchema), deleteOwnDomain);
router.get('/getByAuth', auth, validateQuery(getOwnDomainsByAuthSchema), getOwnDomainsByAuth);

module.exports = router;

