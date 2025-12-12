const Joi = require('joi');

// Service schema for OrderMethod
const serviceSchema = Joi.object({
  ReceiveOnEmail: Joi.boolean().default(false),
  ReceiveOnSms: Joi.boolean().default(false),
  ReceiveOnNotification: Joi.boolean().default(false),
  ReceiveOnText: Joi.boolean().default(false)
});

// OrderMethod schema
const orderMethodSchema = Joi.object({
  MobileApp: Joi.boolean().default(false),
  Service: Joi.array().items(serviceSchema).default([]),
  Tablet: Joi.boolean().default(false)
});

const createVendorStoreSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  StoreName: Joi.string().trim().max(200).required(),
  StoreAddress: Joi.string().trim().max(500).optional().allow(''),
  EmailAddress: Joi.string().trim().email().max(200).optional().allow(''),
  Country: Joi.string().trim().max(100).optional().allow(''),
  State: Joi.string().trim().max(100).optional().allow(''),
  City: Joi.string().trim().max(100).optional().allow(''),
  LocationName: Joi.string().trim().max(200).optional().allow(''),
  StreetNo: Joi.string().trim().max(50).optional().allow(''),
  StreetName: Joi.string().trim().max(200).optional().allow(''),
  ZipCode: Joi.string().trim().max(20).optional().allow(''),
  StoreNumber: Joi.string().trim().max(50).optional().allow(''),
  StartFreeTrail: Joi.boolean().optional().default(true),
  StartFreeTraillDate: Joi.date().optional().allow(null),
  StoreLogo: Joi.string().trim().max(500).optional().allow(''),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  mobileno: Joi.string().trim().pattern(/^[0-9]{10}$/).max(20).optional().allow(''),
  KYC_RecentUtilityBill: Joi.string().trim().max(500).optional().allow(''),
  KycDrivingLicence: Joi.string().trim().max(500).optional().allow(''),
  KYC_BusinessLicenceNo: Joi.string().trim().max(100).optional().allow(''),
  KYC_EINNo: Joi.string().trim().max(100).optional().allow(''),
  OrderMethod: orderMethodSchema.optional(),
  Status: Joi.boolean().optional().default(true)
});

const updateVendorStoreSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional(),
  StoreName: Joi.string().trim().max(200).optional(),
  StoreAddress: Joi.string().trim().max(500).optional().allow(''),
  EmailAddress: Joi.string().trim().email().max(200).optional().allow(''),
  Country: Joi.string().trim().max(100).optional().allow(''),
  State: Joi.string().trim().max(100).optional().allow(''),
  City: Joi.string().trim().max(100).optional().allow(''),
  LocationName: Joi.string().trim().max(200).optional().allow(''),
  StreetNo: Joi.string().trim().max(50).optional().allow(''),
  StreetName: Joi.string().trim().max(200).optional().allow(''),
  ZipCode: Joi.string().trim().max(20).optional().allow(''),
  StoreNumber: Joi.string().trim().max(50).optional().allow(''),
  StartFreeTrail: Joi.boolean().optional(),
  StartFreeTraillDate: Joi.date().optional().allow(null),
  StoreLogo: Joi.string().trim().max(500).optional().allow(''),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  mobileno: Joi.string().trim().pattern(/^[0-9]{10}$/).max(20).optional().allow(''),
  KYC_RecentUtilityBill: Joi.string().trim().max(500).optional().allow(''),
  KycDrivingLicence: Joi.string().trim().max(500).optional().allow(''),
  KYC_BusinessLicenceNo: Joi.string().trim().max(100).optional().allow(''),
  KYC_EINNo: Joi.string().trim().max(100).optional().allow(''),
  OrderMethod: orderMethodSchema.optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getVendorStoreByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllVendorStoresSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Store_id', 'StoreName').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorStoresByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Store_id', 'StoreName').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorDashboardSchema = Joi.object({
  Vender_store_id: Joi.number().integer().positive().required()
});

module.exports = {
  createVendorStoreSchema,
  updateVendorStoreSchema,
  getVendorStoreByIdSchema,
  getAllVendorStoresSchema,
  getVendorStoresByAuthSchema,
  getVendorDashboardSchema
};

