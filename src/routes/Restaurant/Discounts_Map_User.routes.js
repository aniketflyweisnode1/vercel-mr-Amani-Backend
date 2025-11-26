const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createDiscountsMapUser,
  getAllDiscountsMapUsers,
  getDiscountsMapUserById,
  updateDiscountsMapUser,
  deleteDiscountsMapUser,
  getDiscountsMapUsersByAuth,
  getDiscountsMapUsersByUserId,
  getDiscountsMapUsersByBusinessBranchId
} = require('../../controllers/Discounts_Map_User.controller');
const {
  createDiscountsMapUserSchema,
  updateDiscountsMapUserSchema,
  getDiscountsMapUserByIdSchema,
  getAllDiscountsMapUsersSchema,
  getDiscountsMapUsersByAuthSchema,
  getDiscountsMapUsersByUserIdParamsSchema,
  getDiscountsMapUsersByUserIdQuerySchema,
  getDiscountsMapUsersByBusinessBranchIdParamsSchema,
  getDiscountsMapUsersByBusinessBranchIdQuerySchema
} = require('../../../validators/Discounts_Map_User.validator');

router.post('/create', auth, validateBody(createDiscountsMapUserSchema), createDiscountsMapUser);
router.get('/getAll', auth, validateQuery(getAllDiscountsMapUsersSchema), getAllDiscountsMapUsers);
router.get('/getById/:id', auth, validateParams(getDiscountsMapUserByIdSchema), getDiscountsMapUserById);
router.put('/update/:id', auth, validateParams(getDiscountsMapUserByIdSchema), validateBody(updateDiscountsMapUserSchema), updateDiscountsMapUser);
router.delete('/delete/:id', auth, validateParams(getDiscountsMapUserByIdSchema), deleteDiscountsMapUser);
router.get('/getByAuth', auth, validateQuery(getDiscountsMapUsersByAuthSchema), getDiscountsMapUsersByAuth);
router.get('/getByUserId/:User_id', auth, validateParams(getDiscountsMapUsersByUserIdParamsSchema), validateQuery(getDiscountsMapUsersByUserIdQuerySchema), getDiscountsMapUsersByUserId);
router.get('/getByBusinessBranchId/:business_Branch_id', auth, validateParams(getDiscountsMapUsersByBusinessBranchIdParamsSchema), validateQuery(getDiscountsMapUsersByBusinessBranchIdQuerySchema), getDiscountsMapUsersByBusinessBranchId);

module.exports = router;

