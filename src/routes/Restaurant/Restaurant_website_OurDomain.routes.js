const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createOurDomain,
  getAllOurDomains,
  getOurDomainById,
  updateOurDomain,
  deleteOurDomain,
  getOurDomainsByAuth,
  getOurDomainsByBranchId,
  getOurDomainsByReviewsStatus
} = require('../../controllers/Restaurant_website_OurDomain.controller');
const {
  createOurDomainSchema,
  updateOurDomainSchema,
  getOurDomainByIdSchema,
  getAllOurDomainsSchema,
  getOurDomainsByAuthSchema,
  getOurDomainsByBranchParamsSchema,
  getOurDomainsByBranchQuerySchema,
  getOurDomainsByReviewsStatusParamsSchema
} = require('../../../validators/Restaurant_website_OurDomain.validator');

router.post('/create', auth, validateBody(createOurDomainSchema), createOurDomain);
router.get('/getAll', validateQuery(getAllOurDomainsSchema), getAllOurDomains);
router.get('/getById/:id', auth, validateParams(getOurDomainByIdSchema), getOurDomainById);
router.put('/update/:id', auth, validateParams(getOurDomainByIdSchema), validateBody(updateOurDomainSchema), updateOurDomain);
router.delete('/delete/:id', auth, validateParams(getOurDomainByIdSchema), deleteOurDomain);
router.get('/getByAuth', auth, validateQuery(getOurDomainsByAuthSchema), getOurDomainsByAuth);
router.get('/getByBranchId/:business_Branch_id', auth, validateQuery(getOurDomainsByBranchQuerySchema), validateParams(getOurDomainsByBranchParamsSchema), getOurDomainsByBranchId);
router.get('/getByReviewsStatus/:ReviewsStatus', auth, validateParams(getOurDomainsByReviewsStatusParamsSchema), getOurDomainsByReviewsStatus);

module.exports = router;


