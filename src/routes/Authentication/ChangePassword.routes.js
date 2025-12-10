const express = require('express');
const router = express.Router();

const { mobileVerify, otpVerify, changePassword } = require('../../controllers/ChangePassword.controller');
const { validateBody } = require('../../../middleware/validation');
const { mobileVerifySchema, otpVerifySchema, changePasswordSchema } = require('../../../validators/ChangePassword.validator');

router.post('/mobileVerify', validateBody(mobileVerifySchema), mobileVerify);
router.post('/otpVerify', validateBody(otpVerifySchema), otpVerify);
router.post('/changePassword', validateBody(changePasswordSchema), changePassword);

module.exports = router;
