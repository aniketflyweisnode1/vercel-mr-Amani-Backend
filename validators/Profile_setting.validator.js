const Joi = require('joi');

const notificationSchema = Joi.object({
  Type: Joi.string().required(),
  Status: Joi.boolean().required()
});

const createProfileSettingSchema = Joi.object({
  User_id: Joi.number().integer().positive().required(),
  SmsAlerts: Joi.boolean().optional().default(false),
  appTheme: Joi.string().valid('Red & White', 'Blue & White').optional().default('Red & White'),
  TermsCondition: Joi.boolean().optional().default(false),
  PrivacyPolicy: Joi.boolean().optional().default(false),
  Notification: Joi.array().items(notificationSchema).optional().default([]),
  Status: Joi.boolean().optional().default(true)
});

const updateProfileSettingSchema = Joi.object({
  SmsAlerts: Joi.boolean().optional(),
  appTheme: Joi.string().valid('Red & White', 'Blue & White').optional(),
  TermsCondition: Joi.boolean().optional(),
  PrivacyPolicy: Joi.boolean().optional(),
  Notification: Joi.array().items(notificationSchema).optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getProfileSettingByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllProfileSettingsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.boolean().optional(),
  User_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Profile_setting_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getProfileSettingByUserIdSchema = Joi.object({
  User_id: Joi.number().integer().positive().required()
});

module.exports = {
  createProfileSettingSchema,
  updateProfileSettingSchema,
  getProfileSettingByIdSchema,
  getAllProfileSettingsSchema,
  getProfileSettingByUserIdSchema
};

