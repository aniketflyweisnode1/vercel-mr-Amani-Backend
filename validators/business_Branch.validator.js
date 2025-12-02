const Joi = require('joi');

const offerEntrySchema = Joi.object({
  offer: Joi.string().trim().allow('').default(''),
  use: Joi.boolean().default(false)
});

const thirdPartyEntrySchema = Joi.object({
  ThirdParty: Joi.string().trim().allow('').default(''),
  use: Joi.boolean().default(false)
});

const facilityEntrySchema = Joi.object({
  facility: Joi.string().trim().allow('').default(''),
  use: Joi.boolean().default(false)
});

const orderMethodSchema = Joi.object({
  MobileApp: Joi.array().items(facilityEntrySchema).optional(),
  Tablet: Joi.array().items(facilityEntrySchema).optional()
}).optional();

const createBusinessBranchSchema = Joi.object({
  Business_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  Business_Details_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  subscription_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  firstName: Joi.string()
    .trim()
    .max(150)
    .optional()
    .allow(''),
  lastName: Joi.string()
    .trim()
    .max(150)
    .optional()
    .allow(''),
  Email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .allow(''),
  Driving_licenceFile: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  printingTypesetting: Joi.boolean()
    .optional()
    .default(false),
  BranchCount: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),
  EmployeesCount: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),
  DayOpenCount: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0),
  GoogleLocaitonAddress: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  Address: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  StreetNumber: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow(''),
  StreetName: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow(''),
  City_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  State_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  Country_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  Zipcode: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow(''),
  EmployeeIdFile: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  FoodServiceLicenseFile: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  SericeOfferPOP: Joi.array()
    .items(offerEntrySchema)
    .optional()
    .default([]),
  ThirdPartyDelivery: Joi.array()
    .items(thirdPartyEntrySchema)
    .optional()
    .default([]),
  OrderMethod: orderMethodSchema,
  emozi: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow(''),
  BranchImage: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

const updateBusinessBranchSchema = Joi.object({
  Business_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  subscription_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  firstName: Joi.string()
    .trim()
    .max(150)
    .optional()
    .allow(''),
  lastName: Joi.string()
    .trim()
    .max(150)
    .optional()
    .allow(''),
  Email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .allow(''),
  Driving_licenceFile: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  printingTypesetting: Joi.boolean()
    .optional(),
  BranchCount: Joi.number()
    .integer()
    .min(0)
    .optional(),
  EmployeesCount: Joi.number()
    .integer()
    .min(0)
    .optional(),
  DayOpenCount: Joi.number()
    .integer()
    .min(0)
    .optional(),
  GoogleLocaitonAddress: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  Address: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  StreetNumber: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow(''),
  StreetName: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow(''),
  City_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  State_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  Country_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  Zipcode: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow(''),
  EmployeeIdFile: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  FoodServiceLicenseFile: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  SericeOfferPOP: Joi.array()
    .items(offerEntrySchema)
    .optional(),
  ThirdPartyDelivery: Joi.array()
    .items(thirdPartyEntrySchema)
    .optional(),
  OrderMethod: orderMethodSchema,
  emozi: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow(''),
  BranchImage: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getBusinessBranchByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Business Branch ID must be a valid ObjectId or positive number',
      'string.empty': 'Business Branch ID is required'
    })
});

const getAllBusinessBranchesSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10),
  search: Joi.string()
    .trim()
    .optional()
    .allow(''),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  Business_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  subscription_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  City_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  State_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  Country_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  printingTypesetting: Joi.string()
    .valid('true', 'false')
    .optional(),
  BranchCount: Joi.number()
    .integer()
    .min(0)
    .optional(),
  EmployeesCount: Joi.number()
    .integer()
    .min(0)
    .optional(),
  DayOpenCount: Joi.number()
    .integer()
    .min(0)
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'firstName', 'lastName', 'BranchCount', 'EmployeesCount', 'DayOpenCount')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

const getBusinessBranchesByAuthSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'firstName', 'lastName', 'BranchCount', 'EmployeesCount', 'DayOpenCount')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

module.exports = {
  createBusinessBranchSchema,
  updateBusinessBranchSchema,
  getBusinessBranchByIdSchema,
  getAllBusinessBranchesSchema,
  getBusinessBranchesByAuthSchema
};

