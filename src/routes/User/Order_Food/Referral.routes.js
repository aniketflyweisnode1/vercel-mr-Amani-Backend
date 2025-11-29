const express = require('express');
const router = express.Router();
const { auth } = require('../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../middleware/validation');
const {
  createReferral,
  getAllReferrals,
  getReferralById,
  updateReferral,
  deleteReferral,
  getReferralsByAuth
} = require('../../../controllers/Referral.controller');
const {
  createReferralSchema,
  updateReferralSchema,
  getReferralByIdSchema,
  getAllReferralsSchema,
  getReferralsByAuthSchema
} = require('../../../../validators/Referral.validator');

router.post('/create', auth, validateBody(createReferralSchema), createReferral);
router.get('/getAll', validateQuery(getAllReferralsSchema), getAllReferrals);
router.get('/getById/:id', auth, validateParams(getReferralByIdSchema), getReferralById);
router.put('/update/:id', auth, validateParams(getReferralByIdSchema), validateBody(updateReferralSchema), updateReferral);
router.delete('/delete/:id', auth, validateParams(getReferralByIdSchema), deleteReferral);
router.get('/getByAuth', auth, validateQuery(getReferralsByAuthSchema), getReferralsByAuth);

module.exports = router;

