const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createScheduleEveryOne,
  getAllScheduleEveryOne,
  getScheduleEveryOneById,
  updateScheduleEveryOne,
  deleteScheduleEveryOne,
  getScheduleEveryOneByAuth,
  getScheduleEveryOneByTypeId
} = require('../../controllers/WorkForceManagement_Schedule_EveryOne.controller');
const {
  createScheduleEveryOneSchema,
  updateScheduleEveryOneSchema,
  getScheduleEveryOneByIdSchema,
  getAllScheduleEveryOneSchema,
  getScheduleEveryOneByAuthSchema,
  getScheduleEveryOneByTypeParamsSchema,
  getScheduleEveryOneByTypeQuerySchema
} = require('../../../validators/WorkForceManagement_Schedule_EveryOne.validator');

router.post('/create', auth, validateBody(createScheduleEveryOneSchema), createScheduleEveryOne);
router.get('/getAll', validateQuery(getAllScheduleEveryOneSchema), getAllScheduleEveryOne);
router.get('/getById/:id', auth, validateParams(getScheduleEveryOneByIdSchema), getScheduleEveryOneById);
router.put('/update/:id', auth, validateParams(getScheduleEveryOneByIdSchema), validateBody(updateScheduleEveryOneSchema), updateScheduleEveryOne);
router.delete('/delete/:id', auth, validateParams(getScheduleEveryOneByIdSchema), deleteScheduleEveryOne);
router.get('/getByAuth', auth, validateQuery(getScheduleEveryOneByAuthSchema), getScheduleEveryOneByAuth);
router.get('/getByTypeId/:type', auth, validateParams(getScheduleEveryOneByTypeParamsSchema), validateQuery(getScheduleEveryOneByTypeQuerySchema), getScheduleEveryOneByTypeId);

module.exports = router;



