const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createUserAddress,
  getAllUserAddresses,
  getUserAddressById,
  updateUserAddress,
  deleteUserAddress,
  getUserAddressesByAuth
} = require('../../controllers/User_Address.controller');
const {
  createUserAddressSchema,
  updateUserAddressSchema,
  getUserAddressByIdSchema,
  getAllUserAddressesSchema,
  getUserAddressesByAuthSchema
} = require('../../../validators/User_Address.validator');

router.post('/create', auth, validateBody(createUserAddressSchema), createUserAddress);
router.get('/getAll', validateQuery(getAllUserAddressesSchema), getAllUserAddresses);
router.get('/getById/:id', auth, validateParams(getUserAddressByIdSchema), getUserAddressById);
router.put('/update/:id', auth, validateParams(getUserAddressByIdSchema), validateBody(updateUserAddressSchema), updateUserAddress);
router.delete('/delete/:id', auth, validateParams(getUserAddressByIdSchema), deleteUserAddress);
router.get('/getByAuth', auth, validateQuery(getUserAddressesByAuthSchema), getUserAddressesByAuth);

module.exports = router;

