const express = require('express');
const router = express.Router();

// Import controllers
const { createWallet, getAllWallets, getWalletById, updateWallet, deleteWallet } = require('../../controllers/Wallet.controller');

// Import middleware
const { auth } = require('../../../middleware/auth.js');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createWalletSchema, updateWalletSchema, getWalletByIdSchema, getAllWalletsSchema } = require('../../../validators/Wallet.validator');

// Routes
router.post('/create', auth, validateBody(createWalletSchema), createWallet);
router.get('/getAll', validateQuery(getAllWalletsSchema), getAllWallets);
router.get('/getById/:id', auth, validateParams(getWalletByIdSchema), getWalletById);
router.put('/update/:id', auth, validateParams(getWalletByIdSchema), validateBody(updateWalletSchema), updateWallet);
router.delete('/delete/:id', auth, validateParams(getWalletByIdSchema), deleteWallet);

module.exports = router;

