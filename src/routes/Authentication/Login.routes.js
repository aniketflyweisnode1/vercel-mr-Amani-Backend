const express = require('express');
const router = express.Router();


const { userLogin, resendOTP, verifyOTPHandler, userLogout } = require('../../controllers/UserAuth.controller.js');
const { loginVendor, loginAdmin, loginRestaurant } = require('../../controllers/VendorAuth.controller.js');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody } = require('../../../middleware/validation');

// Import validators
const { userLoginSchema, resendOTPSchema, verifyOTPSchema } = require('../../../validators/user.validator');
const { loginVendorSchema } = require('../../../validators/vendor.validator');


router.post('/userLogin', validateBody(userLoginSchema), userLogin);
router.post('/resendOtp', validateBody(resendOTPSchema), resendOTP);
router.post('/verify_otp', validateBody(verifyOTPSchema), verifyOTPHandler);
router.post('/logout', auth, userLogout);
router.post('/loginVendor', validateBody(loginVendorSchema), loginVendor);
router.post('/loginAdmin', validateBody(loginVendorSchema), loginAdmin);
router.post('/loginRestaurant', validateBody(loginVendorSchema), loginRestaurant);

module.exports = router;