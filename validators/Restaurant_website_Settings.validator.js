const Joi = require('joi');

const idSchema = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
).required();

const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  Restaurant_website_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Restaurant_website_Settings_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createSettingsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required(),
  Restaurant_website_id: Joi.number().integer().positive().required(),
  pickup: Joi.boolean().optional(),
  CurbsidePickup: Joi.boolean().optional(),
  Delivery: Joi.boolean().optional(),
  HandIteToMe: Joi.boolean().optional(),
  LeaveitAtmyDoor: Joi.boolean().optional(),
  InHouseDelivery: Joi.boolean().optional(),
  UberDelivery: Joi.boolean().optional(),
  DeliveryType: Joi.string().trim().max(100).optional().allow(''),
  EableFlatFee: Joi.boolean().optional(),
  MarketPlaxe_OrderForPickUp: Joi.boolean().optional(),
  MarketPlaxe_OrderForDeleivery: Joi.boolean().optional(),
  Payment_PayinStore: Joi.boolean().optional(),
  Payment_CreditCard: Joi.boolean().optional(),
  Payment_ApplePay: Joi.boolean().optional(),
  Payment_GooglePay: Joi.boolean().optional(),
  PaymentServiceStrip_AccountNo: Joi.string().trim().max(150).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateSettingsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  Restaurant_website_id: Joi.number().integer().positive().optional(),
  pickup: Joi.boolean().optional(),
  CurbsidePickup: Joi.boolean().optional(),
  Delivery: Joi.boolean().optional(),
  HandIteToMe: Joi.boolean().optional(),
  LeaveitAtmyDoor: Joi.boolean().optional(),
  InHouseDelivery: Joi.boolean().optional(),
  UberDelivery: Joi.boolean().optional(),
  DeliveryType: Joi.string().trim().max(100).optional().allow(''),
  EableFlatFee: Joi.boolean().optional(),
  MarketPlaxe_OrderForPickUp: Joi.boolean().optional(),
  MarketPlaxe_OrderForDeleivery: Joi.boolean().optional(),
  Payment_PayinStore: Joi.boolean().optional(),
  Payment_CreditCard: Joi.boolean().optional(),
  Payment_ApplePay: Joi.boolean().optional(),
  Payment_GooglePay: Joi.boolean().optional(),
  PaymentServiceStrip_AccountNo: Joi.string().trim().max(150).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getSettingsByIdSchema = Joi.object({
  id: idSchema
});

const getAllSettingsSchema = Joi.object(paginationSchema);

const getSettingsByAuthSchema = Joi.object(paginationSchema);

module.exports = {
  createSettingsSchema,
  updateSettingsSchema,
  getSettingsByIdSchema,
  getAllSettingsSchema,
  getSettingsByAuthSchema
};


