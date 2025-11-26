const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createAdminPlan,
  getAllAdminPlans,
  getAdminPlanById,
  updateAdminPlan,
  deleteAdminPlan,
  getAdminPlansByAuth
} = require('../../controllers/Admin_Plan.controller');
const {
  createAdminPlanSchema,
  updateAdminPlanSchema,
  getAdminPlanByIdSchema,
  getAllAdminPlansSchema,
  getAdminPlansByAuthSchema
} = require('../../../validators/Admin_Plan.validator');

router.post('/create', auth, validateBody(createAdminPlanSchema), createAdminPlan);
router.get('/getAll', validateQuery(getAllAdminPlansSchema), getAllAdminPlans);
router.get('/getById/:id', auth, validateParams(getAdminPlanByIdSchema), getAdminPlanById);
router.put('/update/:id', auth, validateParams(getAdminPlanByIdSchema), validateBody(updateAdminPlanSchema), updateAdminPlan);
router.delete('/delete/:id', auth, validateParams(getAdminPlanByIdSchema), deleteAdminPlan);
router.get('/getByAuth', auth, validateQuery(getAdminPlansByAuthSchema), getAdminPlansByAuth);

module.exports = router;

