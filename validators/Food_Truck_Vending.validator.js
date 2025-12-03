const Joi = require('joi');

const idSchema = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
).required();

const paginationBase = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Food_Truck_Vending_id', 'EventName', 'StartDate').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const whatOccasionItemSchema = Joi.object({
  Type: Joi.string().valid('One Time Event', 'Recurring Food Service').required(),
  Status: Joi.boolean().default(false).optional()
});

const occasionItemSchema = Joi.object({
  Type: Joi.string().trim().max(200).optional().allow(''),
  Status: Joi.boolean().default(false).optional()
});

const createFoodTruckVendingSchema = Joi.object({
  What_Occasion: Joi.array().items(whatOccasionItemSchema).optional().default([]),
  EventName: Joi.string().trim().max(200).optional().allow(''),
  Website: Joi.string().trim().uri().max(500).optional().allow(''),
  Occasion: Joi.array().items(occasionItemSchema).optional().default([]),
  CuisineSelection: Joi.array().items(occasionItemSchema).optional().default([]),
  GuestCount: Joi.number().integer().min(1).optional(),
  StartDate: Joi.date().iso().optional(),
  EndDate: Joi.date().iso().optional(),
  StartTime: Joi.string().trim().max(50).optional().allow(''),
  EndTime: Joi.string().trim().max(50).optional().allow(''),
  MinimumGuarantee: Joi.number().min(0).optional(),
  Address: Joi.string().trim().max(500).optional().allow(''),
  City: Joi.string().trim().max(100).optional().allow(''),
  State: Joi.string().trim().max(100).optional().allow(''),
  zip: Joi.string().trim().max(20).optional().allow(''),
  Country: Joi.string().trim().max(100).optional().allow(''),
  Name: Joi.string().trim().max(200).optional().allow(''),
  Email: Joi.string().trim().email().max(200).optional().allow(''),
  Phone: Joi.string().trim().max(20).optional().allow(''),
  Budget: Joi.number().min(0).optional(),
  IsAgree: Joi.boolean().optional().default(false),
  Status: Joi.boolean().optional().default(true)
});

const updateFoodTruckVendingSchema = Joi.object({
  What_Occasion: Joi.array().items(whatOccasionItemSchema).optional(),
  EventName: Joi.string().trim().max(200).optional().allow(''),
  Website: Joi.string().trim().uri().max(500).optional().allow(''),
  Occasion: Joi.array().items(occasionItemSchema).optional(),
  CuisineSelection: Joi.array().items(occasionItemSchema).optional(),
  GuestCount: Joi.number().integer().min(1).optional(),
  StartDate: Joi.date().iso().optional(),
  EndDate: Joi.date().iso().optional(),
  StartTime: Joi.string().trim().max(50).optional().allow(''),
  EndTime: Joi.string().trim().max(50).optional().allow(''),
  MinimumGuarantee: Joi.number().min(0).optional(),
  Address: Joi.string().trim().max(500).optional().allow(''),
  City: Joi.string().trim().max(100).optional().allow(''),
  State: Joi.string().trim().max(100).optional().allow(''),
  zip: Joi.string().trim().max(20).optional().allow(''),
  Country: Joi.string().trim().max(100).optional().allow(''),
  Name: Joi.string().trim().max(200).optional().allow(''),
  Email: Joi.string().trim().email().max(200).optional().allow(''),
  Phone: Joi.string().trim().max(20).optional().allow(''),
  Budget: Joi.number().min(0).optional(),
  IsAgree: Joi.boolean().optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getFoodTruckVendingByIdSchema = Joi.object({
  id: idSchema
});

const getAllFoodTruckVendingSchema = Joi.object(paginationBase);

const getFoodTruckVendingByAuthSchema = Joi.object(paginationBase);

const getFoodTruckVendingByPaymentOptionsSchema = Joi.object({
  ...paginationBase,
  paymentOptions: Joi.string().required()
});

module.exports = {
  createFoodTruckVendingSchema,
  updateFoodTruckVendingSchema,
  getFoodTruckVendingByIdSchema,
  getAllFoodTruckVendingSchema,
  getFoodTruckVendingByAuthSchema,
  getFoodTruckVendingByPaymentOptionsSchema
};

