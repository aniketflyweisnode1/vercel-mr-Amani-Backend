const express = require('express');
const router = express.Router();

const { createPlan, getAllPlans, getPlanById, updatePlan, deletePlan, getPlansByAuth } = require('../../controllers/Plan.controller');

const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { createPlanSchema, updatePlanSchema, getPlanByIdSchema, getAllPlansSchema, getPlansByAuthSchema } = require('../../../validators/Plan.validator');

router.post('/create', auth, validateBody(createPlanSchema), createPlan);
router.get('/getAll', validateQuery(getAllPlansSchema), getAllPlans);
router.get('/getById/:id', auth, validateParams(getPlanByIdSchema), getPlanById);
router.put('/update/:id', auth, validateParams(getPlanByIdSchema), validateBody(updatePlanSchema), updatePlan);
router.delete('/delete/:id', auth, validateParams(getPlanByIdSchema), deletePlan);
router.get('/getByAuth', auth, validateQuery(getPlansByAuthSchema), getPlansByAuth);

module.exports = router;

