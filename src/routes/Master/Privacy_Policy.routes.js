const express = require('express');
const router = express.Router();

// Import controllers
const { createPrivacyPolicy, getAllPrivacyPolicies, getPrivacyPolicyById, updatePrivacyPolicy, deletePrivacyPolicy } = require('../../controllers/Privacy_Policy.controller');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createPrivacyPolicySchema, updatePrivacyPolicySchema, getPrivacyPolicyByIdSchema, getAllPrivacyPoliciesSchema } = require('../../../validators/Privacy_Policy.validator');

// Routes
router.post('/create', auth, validateBody(createPrivacyPolicySchema), createPrivacyPolicy);
router.get('/getAll', validateQuery(getAllPrivacyPoliciesSchema), getAllPrivacyPolicies);
router.get('/getById/:id', auth, validateParams(getPrivacyPolicyByIdSchema), getPrivacyPolicyById);
router.put('/update/:id', auth, validateParams(getPrivacyPolicyByIdSchema), validateBody(updatePrivacyPolicySchema), updatePrivacyPolicy);
router.delete('/delete/:id', auth, validateParams(getPrivacyPolicyByIdSchema), deletePrivacyPolicy);

module.exports = router;

