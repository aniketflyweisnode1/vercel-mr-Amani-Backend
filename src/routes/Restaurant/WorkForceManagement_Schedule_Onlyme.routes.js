const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createScheduleOnlyMe,
  getAllScheduleOnlyMe,
  getScheduleOnlyMeById,
  updateScheduleOnlyMe,
  deleteScheduleOnlyMe,
  getScheduleOnlyMeByAuth,
  getScheduleOnlyMeByTypeId
} = require('../../controllers/WorkForceManagement_Schedule_Onlyme.controller');
const {
  createScheduleOnlyMeSchema,
  updateScheduleOnlyMeSchema,
  getScheduleOnlyMeByIdSchema,
  getAllScheduleOnlyMeSchema,
  getScheduleOnlyMeByAuthSchema,
  getScheduleOnlyMeByTypeParamsSchema,
  getScheduleOnlyMeByTypeQuerySchema
} = require('../../../validators/WorkForceManagement_Schedule_Onlyme.validator');

router.post('/create', auth, validateBody(createScheduleOnlyMeSchema), createScheduleOnlyMe);
router.get('/getAll', validateQuery(getAllScheduleOnlyMeSchema), getAllScheduleOnlyMe);
router.get('/getById/:id', auth, validateParams(getScheduleOnlyMeByIdSchema), getScheduleOnlyMeById);
router.put('/update/:id', auth, validateParams(getScheduleOnlyMeByIdSchema), validateBody(updateScheduleOnlyMeSchema), updateScheduleOnlyMe);
router.delete('/delete/:id', auth, validateParams(getScheduleOnlyMeByIdSchema), deleteScheduleOnlyMe);
router.get('/getByAuth', auth, validateQuery(getScheduleOnlyMeByAuthSchema), getScheduleOnlyMeByAuth);
router.get('/getByTypeId/:type', auth, validateParams(getScheduleOnlyMeByTypeParamsSchema), validateQuery(getScheduleOnlyMeByTypeQuerySchema), getScheduleOnlyMeByTypeId);

module.exports = router;



