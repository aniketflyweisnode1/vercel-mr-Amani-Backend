const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createDasboardList,
  getAllDasboardLists,
  getDasboardListById,
  updateDasboardList,
  deleteDasboardList,
  getDasboardListsByAuth
} = require('../../controllers/DasboardList.controller');
const {
  createDasboardListSchema,
  updateDasboardListSchema,
  getDasboardListByIdSchema,
  getAllDasboardListsSchema,
  getDasboardListsByAuthSchema
} = require('../../../validators/DasboardList.validator');

router.post('/create', auth, validateBody(createDasboardListSchema), createDasboardList);
router.get('/getAll', validateQuery(getAllDasboardListsSchema), getAllDasboardLists);
router.get('/getById/:id', auth, validateParams(getDasboardListByIdSchema), getDasboardListById);
router.put('/update/:id', auth, validateParams(getDasboardListByIdSchema), validateBody(updateDasboardListSchema), updateDasboardList);
router.delete('/delete/:id', auth, validateParams(getDasboardListByIdSchema), deleteDasboardList);
router.get('/getByAuth', auth, validateQuery(getDasboardListsByAuthSchema), getDasboardListsByAuth);

module.exports = router;

