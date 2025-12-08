const Business_Branch = require('../models/business_Branch.model');
const City = require('../models/city.model');
const State = require('../models/state.model');
const Country = require('../models/country.model');
const Subscription = require('../models/subscription.model');
const Business_Details = require('../models/Business_Details.model');
const Order_Now = require('../models/Order_Now.model');
const Restaurant_Items_Reviews = require('../models/Restaurant_Items_Reviews.model');
const Transaction = require('../models/transaction.model');
const Restaurant_Items = require('../models/Restaurant_Items.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const isUndefinedOrNull = (value) => value === undefined || value === null || value === '';

const normalizeBoolean = (value, defaultValue = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return defaultValue;
};

const parseNumber = (value, { fieldName, allowNegative = true, required = false, integer = false } = {}) => {
  if (isUndefinedOrNull(value)) {
    if (required) {
      return { error: `${fieldName} is required` };
    }
    return { value: undefined };
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return { error: `${fieldName} must be a number` };
  }
  if (integer && !Number.isInteger(numeric)) {
    return { error: `${fieldName} must be an integer` };
  }
  if (!allowNegative && numeric < 0) {
    return { error: `${fieldName} cannot be negative` };
  }
  return { value: numeric };
};

const ensureRecordExists = async (Model, field, value) => {
  if (value === undefined || value === null) {
    return true;
  }
  const record = await Model.findOne({ [field]: value });
  return Boolean(record);
};

// Helper function to lookup ID by name
const lookupIdByName = async (Model, nameField, nameValue, idField) => {
  if (!nameValue || typeof nameValue !== 'string') {
    return null;
  }
  const record = await Model.findOne({ [nameField]: { $regex: new RegExp(`^${nameValue.trim()}$`, 'i') } });
  return record ? record[idField] : null;
};

// Manual population function for Number refs
const populateBusinessBranch = async (businessBranches) => {
  const branchesArray = Array.isArray(businessBranches) ? businessBranches : [businessBranches];
  const populatedBranches = await Promise.all(
    branchesArray.map(async (branch) => {
      if (!branch) return null;
      
      const branchObj = branch.toObject ? branch.toObject() : branch;
      
      // Populate Business_id
      if (branchObj.Business_id) {
        const business = await Business_Details.findOne({ Business_Details_id: branchObj.Business_id })
          .select('Business_Details_id BussinessName user_id');
        if (business) {
          branchObj.Business_id = business.toObject ? business.toObject() : business;
        }
      }
      
      // Populate City_id
      if (branchObj.City_id) {
        const city = await City.findOne({ city_id: branchObj.City_id })
          .select('city_id name');
        if (city) {
          branchObj.City_id = city.toObject ? city.toObject() : city;
        }
      }
      
      // Populate State_id
      if (branchObj.State_id) {
        const state = await State.findOne({ state_id: branchObj.State_id })
          .select('state_id name');
        if (state) {
          branchObj.State_id = state.toObject ? state.toObject() : state;
        }
      }
      
      // Populate Country_id
      if (branchObj.Country_id) {
        const country = await Country.findOne({ country_id: branchObj.Country_id })
          .select('country_id name');
        if (country) {
          branchObj.Country_id = country.toObject ? country.toObject() : country;
        }
      }
      
      // Populate subscription_id
      if (branchObj.subscription_id) {
        const subscription = await Subscription.findOne({ subscription_id: branchObj.subscription_id })
          .select('subscription_id planStatus expiryDate');
        if (subscription) {
          branchObj.subscription_id = subscription.toObject ? subscription.toObject() : subscription;
        }
      }
      
      return branchObj;
    })
  );
  
  return Array.isArray(businessBranches) ? populatedBranches : populatedBranches[0];
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
};

const normalizeOfferEntries = (value, textKey) => {
  const entries = toArray(value).map((entry) => {
    if (typeof entry === 'string') {
      return { [textKey]: entry.trim(), use: false };
    }
    if (entry && typeof entry === 'object') {
      return {
        [textKey]: typeof entry[textKey] === 'string' ? entry[textKey].trim() : '',
        use: normalizeBoolean(entry.use)
      };
    }
    return { [textKey]: '', use: false };
  });

  return entries.filter((entry) => entry[textKey] !== '' || entry.use);
};

const normalizeFacilityEntries = (value) => {
  const items = toArray(value).map((entry) => {
    if (typeof entry === 'string') {
      return { facility: entry.trim(), use: false };
    }
    if (entry && typeof entry === 'object') {
      return {
        facility: typeof entry.facility === 'string' ? entry.facility.trim() : '',
        use: normalizeBoolean(entry.use)
      };
    }
    return { facility: '', use: false };
  });
  return items.filter((entry) => entry.facility !== '' || entry.use);
};

const normalizeOrderMethod = (value) => {
  if (!value) {
    return {
      MobileApp: [],
      Tablet: []
    };
  }

  let orderData = value;
  if (Array.isArray(value)) {
    orderData = value.reduce((acc, entry) => ({
      MobileApp: entry.MobileApp !== undefined ? entry.MobileApp : acc.MobileApp,
      Tablet: entry.Tablet !== undefined ? entry.Tablet : acc.Tablet
    }), { MobileApp: [], Tablet: [] });
  }

  return {
    MobileApp: normalizeFacilityEntries(orderData.MobileApp),
    Tablet: normalizeFacilityEntries(orderData.Tablet)
  };
};

const trimString = (value) => {
  if (isUndefinedOrNull(value)) return undefined;
  return String(value).trim();
};

const createBusinessBranch = asyncHandler(async (req, res) => {
  console.log("==========\n\n", req.body);
  try {
    // Handle both Business_id and Business_Details_id field names
    const businessIdValue = req.body.Business_Details_id;
    const businessIdResult = parseNumber(businessIdValue, { fieldName: 'Business ID', allowNegative: false, integer: true });
    if (businessIdResult.error) {
      return sendError(res, businessIdResult.error, 400);
    }

    const subscriptionIdResult = parseNumber(req.body.subscription_id, { fieldName: 'Subscription ID', allowNegative: false, integer: true });
    if (subscriptionIdResult.error) {
      return sendError(res, subscriptionIdResult.error, 400);
    }

    // Handle City - check for City_id first, then lookup by City name if provided
    let cityIdValue = req.body.City_id;
    if (!cityIdValue && req.body.City) {
      cityIdValue = await lookupIdByName(City, 'name', req.body.City, 'city_id');
    }
    const cityIdResult = parseNumber(cityIdValue, { fieldName: 'City ID', allowNegative: false, integer: true });
    if (cityIdResult.error) {
      return sendError(res, cityIdResult.error, 400);
    }

    // Handle State - check for State_id first, then lookup by state name/code if provided
    let stateIdValue = req.body.State_id;
    if (!stateIdValue && (req.body.state || req.body.State)) {
      const stateName = req.body.state || req.body.State;
      // Try to find by name or stateCode
      stateIdValue = await lookupIdByName(State, 'name', stateName, 'state_id') || 
                     await lookupIdByName(State, 'stateCode', stateName, 'state_id');
    }
    const stateIdResult = parseNumber(stateIdValue, { fieldName: 'State ID', allowNegative: false, integer: true });
    if (stateIdResult.error) {
      return sendError(res, stateIdResult.error, 400);
    }

    // Handle Country - check for Country_id first, then lookup by country name if provided
    let countryIdValue = req.body.Country_id;
    if (!countryIdValue && (req.body.country || req.body.Country)) {
      const countryName = req.body.country || req.body.Country;
      countryIdValue = await lookupIdByName(Country, 'name', countryName, 'country_id');
    }
    const countryIdResult = parseNumber(countryIdValue, { fieldName: 'Country ID', allowNegative: false, integer: true });
    if (countryIdResult.error) {
      return sendError(res, countryIdResult.error, 400);
    }

    const branchCountResult = parseNumber(req.body.BranchCount, { fieldName: 'Branch count', allowNegative: false, integer: true });
    if (branchCountResult.error) {
      return sendError(res, branchCountResult.error, 400);
    }

    const employeesCountResult = parseNumber(req.body.EmployeesCount, { fieldName: 'Employees count', allowNegative: false, integer: true });
    if (employeesCountResult.error) {
      return sendError(res, employeesCountResult.error, 400);
    }

    const dayOpenCountResult = parseNumber(req.body.DayOpenCount, { fieldName: 'Day open count', allowNegative: false, integer: true });
    if (dayOpenCountResult.error) {
      return sendError(res, dayOpenCountResult.error, 400);
    }

    // Handle field name variations - support both standard and alternative field names
    const getFieldValue = (standardField, alternativeField) => {
      return req.body[standardField] !== undefined ? req.body[standardField] : req.body[alternativeField];
    };

    // Build businessBranchData object with all fields from req.body
    const businessBranchData = {
      Business_id: businessIdResult.value ?? null,
      subscription_id: subscriptionIdResult.value ?? null,
      firstName: trimString(getFieldValue('firstName', 'firstName')),
      lastName: trimString(getFieldValue('lastName', 'lastName')),
      Email: trimString(getFieldValue('Email', 'email')),
      Driving_licenceFile: trimString(getFieldValue('Driving_licenceFile', 'driving_licenceFile')),
      printingTypesetting: normalizeBoolean(req.body.printingTypesetting, false),
      BranchCount: branchCountResult.value ?? 0,
      EmployeesCount: employeesCountResult.value ?? 0,
      DayOpenCount: dayOpenCountResult.value ?? 0,
      GoogleLocaitonAddress: trimString(getFieldValue('GoogleLocaitonAddress', 'googleLocationAddress')),
      // Handle address field variations: address -> Address
      Address: trimString(getFieldValue('Address', 'address')),
      // Handle street number variations: StreetNo -> StreetNumber
      StreetNumber: trimString(getFieldValue('StreetNumber', 'StreetNo')),
      // Handle street name variations: Streetname -> StreetName
      StreetName: trimString(getFieldValue('StreetName', 'Streetname')),
      City_id: cityIdResult.value ?? null,
      State_id: stateIdResult.value ?? null,
      Country_id: countryIdResult.value ?? null,
      // Handle zipcode variations: zipcode -> Zipcode
      Zipcode: trimString(getFieldValue('Zipcode', 'zipcode')),
      EmployeeIdFile: trimString(getFieldValue('EmployeeIdFile', 'employeeIdFile')),
      FoodServiceLicenseFile: trimString(getFieldValue('FoodServiceLicenseFile', 'foodServiceLicenseFile')),
      SericeOfferPOP: normalizeOfferEntries(req.body.SericeOfferPOP, 'offer'),
      ThirdPartyDelivery: normalizeOfferEntries(req.body.ThirdPartyDelivery, 'ThirdParty'),
      OrderMethod: normalizeOrderMethod(req.body.OrderMethod),
      emozi: trimString(getFieldValue('emozi', 'emoji')),
      BranchImage: trimString(getFieldValue('BranchImage', 'branchImage')),
      Status: normalizeBoolean(req.body.Status, true), // Handle Status field from req.body
      created_by: req.userIdNumber || null
    };

    // Handle 'name' field - if provided, use it as part of Address if Address is not set
    if (req.body.name && !businessBranchData.Address) {
      businessBranchData.Address = trimString(req.body.name);
    }

    // Remove undefined fields to avoid setting them in the database
    Object.keys(businessBranchData).forEach(key => {
      if (businessBranchData[key] === undefined) {
        delete businessBranchData[key];
      }
    });

    const [
      cityExists,
      stateExists,
      countryExists,
      subscriptionExists
    ] = await Promise.all([
      ensureRecordExists(City, 'city_id', businessBranchData.City_id),
      ensureRecordExists(State, 'state_id', businessBranchData.State_id),
      ensureRecordExists(Country, 'country_id', businessBranchData.Country_id),
      ensureRecordExists(Subscription, 'subscription_id', businessBranchData.subscription_id)
    ]);

    if (businessBranchData.City_id && !cityExists) {
      return sendError(res, 'City not found', 404);
    }
    if (businessBranchData.State_id && !stateExists) {
      return sendError(res, 'State not found', 404);
    }
    if (businessBranchData.Country_id && !countryExists) {
      return sendError(res, 'Country not found', 404);
    }
    if (businessBranchData.subscription_id && !subscriptionExists) {
      return sendError(res, 'Subscription not found', 404);
    }

    const businessBranch = await Business_Branch.create(businessBranchData);
    console.info('Business Branch created successfully', { 
      businessBranchId: businessBranch._id, 
      business_Branch_id: businessBranch.business_Branch_id,
      data: businessBranchData 
    });
    
    // Populate related data before sending response
    const populatedBranch = await populateBusinessBranch(businessBranch);
    
    sendSuccess(res, populatedBranch, 'Business Branch created successfully', 201);
  } catch (error) {
    if (error.statusCode === 400) {
      return sendError(res, error.message, 400);
    }
    console.error('Error creating business branch', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllBusinessBranches = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      Business_id,
      subscription_id,
      City_id,
      State_id,
      Country_id,
      printingTypesetting,
      BranchCount,
      EmployeesCount,
      DayOpenCount,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { Email: { $regex: search, $options: 'i' } },
        { GoogleLocaitonAddress: { $regex: search, $options: 'i' } },
        { Address: { $regex: search, $options: 'i' } },
        { StreetName: { $regex: search, $options: 'i' } },
        { StreetNumber: { $regex: search, $options: 'i' } },
        { Zipcode: { $regex: search, $options: 'i' } },
        { emozi: { $regex: search, $options: 'i' } }
      ];
    }

    if (!isUndefinedOrNull(status)) {
      filter.Status = status === 'true';
    }

    const numericFilters = [
      { key: 'Business_id', value: Business_id },
      { key: 'subscription_id', value: subscription_id },
      { key: 'City_id', value: City_id },
      { key: 'State_id', value: State_id },
      { key: 'Country_id', value: Country_id },
      { key: 'BranchCount', value: BranchCount },
      { key: 'EmployeesCount', value: EmployeesCount },
      { key: 'DayOpenCount', value: DayOpenCount }
    ];

    numericFilters.forEach(({ key, value }) => {
      if (!isUndefinedOrNull(value)) {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          filter[key] = parsed;
        }
      }
    });

    if (!isUndefinedOrNull(printingTypesetting)) {
      filter.printingTypesetting = printingTypesetting === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNumber = Number(page) || 1;
    const limitNumber = Math.min(Number(limit) || 10, 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [businessBranches, total] = await Promise.all([
      Business_Branch.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber),
      Business_Branch.countDocuments(filter)
    ]);

    const populatedBranches = await populateBusinessBranch(businessBranches);

    const totalPages = Math.ceil(total / limitNumber) || 1;
    const pagination = {
      currentPage: pageNumber,
      totalPages,
      totalItems: total,
      itemsPerPage: limitNumber,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1
    };

    console.info('Business Branches retrieved successfully', { total, page: pageNumber, limit: limitNumber });
    sendPaginated(res, populatedBranches, pagination, 'Business Branches retrieved successfully');
  } catch (error) {
    console.error('Error retrieving business branches', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getBusinessBranchById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let businessBranch;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      businessBranch = await Business_Branch.findById(id);
    } else {
      const businessBranchId = parseInt(id, 10);
      if (isNaN(businessBranchId)) return sendNotFound(res, 'Invalid business branch ID format');
      businessBranch = await Business_Branch.findOne({ business_Branch_id: businessBranchId });
    }
    if (!businessBranch) return sendNotFound(res, 'Business Branch not found');
    
    const populatedBranch = await populateBusinessBranch(businessBranch);
    
    console.info('Business Branch retrieved successfully', { businessBranchId: businessBranch._id });
    sendSuccess(res, populatedBranch, 'Business Branch retrieved successfully');
  } catch (error) {
    console.error('Error retrieving business branch', { error: error.message, businessBranchId: req.params.id });
    throw error;
  }
});

const updateBusinessBranch = asyncHandler(async (req, res) => {
  try {
    let hasUpdates = false;
    const { id } = req.params;
    const updateData = {
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (req.body.firstName !== undefined) { updateData.firstName = trimString(req.body.firstName); hasUpdates = true; }
    if (req.body.lastName !== undefined) { updateData.lastName = trimString(req.body.lastName); hasUpdates = true; }
    if (req.body.Email !== undefined) { updateData.Email = trimString(req.body.Email); hasUpdates = true; }
    if (req.body.Driving_licenceFile !== undefined) { updateData.Driving_licenceFile = trimString(req.body.Driving_licenceFile); hasUpdates = true; }
    if (req.body.GoogleLocaitonAddress !== undefined) { updateData.GoogleLocaitonAddress = trimString(req.body.GoogleLocaitonAddress); hasUpdates = true; }
    if (req.body.Address !== undefined) { updateData.Address = trimString(req.body.Address); hasUpdates = true; }
    if (req.body.StreetNumber !== undefined) { updateData.StreetNumber = trimString(req.body.StreetNumber); hasUpdates = true; }
    if (req.body.StreetName !== undefined) { updateData.StreetName = trimString(req.body.StreetName); hasUpdates = true; }
    if (req.body.Zipcode !== undefined) { updateData.Zipcode = trimString(req.body.Zipcode); hasUpdates = true; }
    if (req.body.EmployeeIdFile !== undefined) { updateData.EmployeeIdFile = trimString(req.body.EmployeeIdFile); hasUpdates = true; }
    if (req.body.FoodServiceLicenseFile !== undefined) { updateData.FoodServiceLicenseFile = trimString(req.body.FoodServiceLicenseFile); hasUpdates = true; }
    if (req.body.emozi !== undefined) { updateData.emozi = trimString(req.body.emozi); hasUpdates = true; }
    if (req.body.BranchImage !== undefined) { updateData.BranchImage = trimString(req.body.BranchImage); hasUpdates = true; }

    if (req.body.printingTypesetting !== undefined) {
      updateData.printingTypesetting = normalizeBoolean(req.body.printingTypesetting);
      hasUpdates = true;
    }

    if (req.body.SericeOfferPOP !== undefined) {
      updateData.SericeOfferPOP = normalizeOfferEntries(req.body.SericeOfferPOP, 'offer');
      hasUpdates = true;
    }

    if (req.body.ThirdPartyDelivery !== undefined) {
      updateData.ThirdPartyDelivery = normalizeOfferEntries(req.body.ThirdPartyDelivery, 'ThirdParty');
      hasUpdates = true;
    }

    if (req.body.OrderMethod !== undefined) {
      updateData.OrderMethod = normalizeOrderMethod(req.body.OrderMethod);
      hasUpdates = true;
    }

    const businessIdResult = parseNumber(req.body.Business_id, { fieldName: 'Business ID', allowNegative: false, integer: true });
    if (businessIdResult.error) {
      return sendError(res, businessIdResult.error, 400);
    }
    if (businessIdResult.value !== undefined) {
      updateData.Business_id = businessIdResult.value;
      hasUpdates = true;
    }

    const subscriptionIdResult = parseNumber(req.body.subscription_id, { fieldName: 'Subscription ID', allowNegative: false, integer: true });
    if (subscriptionIdResult.error) {
      return sendError(res, subscriptionIdResult.error, 400);
    }
    if (subscriptionIdResult.value !== undefined) {
      updateData.subscription_id = subscriptionIdResult.value;
      hasUpdates = true;
    }

    const cityIdResult = parseNumber(req.body.City_id, { fieldName: 'City ID', allowNegative: false, integer: true });
    if (cityIdResult.error) {
      return sendError(res, cityIdResult.error, 400);
    }
    if (cityIdResult.value !== undefined) {
      updateData.City_id = cityIdResult.value;
      hasUpdates = true;
    }

    const stateIdResult = parseNumber(req.body.State_id, { fieldName: 'State ID', allowNegative: false, integer: true });
    if (stateIdResult.error) {
      return sendError(res, stateIdResult.error, 400);
    }
    if (stateIdResult.value !== undefined) {
      updateData.State_id = stateIdResult.value;
      hasUpdates = true;
    }

    const countryIdResult = parseNumber(req.body.Country_id, { fieldName: 'Country ID', allowNegative: false, integer: true });
    if (countryIdResult.error) {
      return sendError(res, countryIdResult.error, 400);
    }
    if (countryIdResult.value !== undefined) {
      updateData.Country_id = countryIdResult.value;
      hasUpdates = true;
    }

    const branchCountResult = parseNumber(req.body.BranchCount, { fieldName: 'Branch count', allowNegative: false, integer: true });
    if (branchCountResult.error) {
      return sendError(res, branchCountResult.error, 400);
    }
    if (branchCountResult.value !== undefined) {
      updateData.BranchCount = branchCountResult.value;
      hasUpdates = true;
    }

    const employeesCountResult = parseNumber(req.body.EmployeesCount, { fieldName: 'Employees count', allowNegative: false, integer: true });
    if (employeesCountResult.error) {
      return sendError(res, employeesCountResult.error, 400);
    }
    if (employeesCountResult.value !== undefined) {
      updateData.EmployeesCount = employeesCountResult.value;
      hasUpdates = true;
    }

    const dayOpenCountResult = parseNumber(req.body.DayOpenCount, { fieldName: 'Day open count', allowNegative: false, integer: true });
    if (dayOpenCountResult.error) {
      return sendError(res, dayOpenCountResult.error, 400);
    }
    if (dayOpenCountResult.value !== undefined) {
      updateData.DayOpenCount = dayOpenCountResult.value;
      hasUpdates = true;
    }

    const [
      cityExists,
      stateExists,
      countryExists,
      subscriptionExists
    ] = await Promise.all([
      ensureRecordExists(City, 'city_id', updateData.City_id),
      ensureRecordExists(State, 'state_id', updateData.State_id),
      ensureRecordExists(Country, 'country_id', updateData.Country_id),
      ensureRecordExists(Subscription, 'subscription_id', updateData.subscription_id)
    ]);

    if (updateData.City_id !== undefined && updateData.City_id !== null && !cityExists) {
      return sendError(res, 'City not found', 404);
    }
    if (updateData.State_id !== undefined && updateData.State_id !== null && !stateExists) {
      return sendError(res, 'State not found', 404);
    }
    if (updateData.Country_id !== undefined && updateData.Country_id !== null && !countryExists) {
      return sendError(res, 'Country not found', 404);
    }
    if (updateData.subscription_id !== undefined && updateData.subscription_id !== null && !subscriptionExists) {
      return sendError(res, 'Subscription not found', 404);
    }

    if (!hasUpdates) {
      return sendError(res, 'No valid fields provided for update', 400);
    }

    let businessBranch;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      businessBranch = await Business_Branch.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const businessBranchId = parseInt(id, 10);
      if (isNaN(businessBranchId)) return sendNotFound(res, 'Invalid business branch ID format');
      businessBranch = await Business_Branch.findOneAndUpdate({ business_Branch_id: businessBranchId }, updateData, { new: true, runValidators: true });
    }
    if (!businessBranch) return sendNotFound(res, 'Business Branch not found');
    
    const populatedBranch = await populateBusinessBranch(businessBranch);
    
    console.info('Business Branch updated successfully', { businessBranchId: businessBranch._id });
    sendSuccess(res, populatedBranch, 'Business Branch updated successfully');
  } catch (error) {
    if (error.statusCode === 400) {
      return sendError(res, error.message, 400);
    }
    console.error('Error updating business branch', { error: error.message, businessBranchId: req.params.id });
    throw error;
  }
});

const deleteBusinessBranch = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let businessBranch;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      businessBranch = await Business_Branch.findByIdAndUpdate(id, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    } else {
      const businessBranchId = parseInt(id, 10);
      if (isNaN(businessBranchId)) return sendNotFound(res, 'Invalid business branch ID format');
      businessBranch = await Business_Branch.findOneAndUpdate({ business_Branch_id: businessBranchId }, { Status: false, updated_by: req.userIdNumber || null, updated_at: new Date() }, { new: true });
    }
    if (!businessBranch) return sendNotFound(res, 'Business Branch not found');
    console.info('Business Branch deleted successfully', { businessBranchId: businessBranch._id });
    sendSuccess(res, businessBranch, 'Business Branch deleted successfully');
  } catch (error) {
    console.error('Error deleting business branch', { error: error.message, businessBranchId: req.params.id });
    throw error;
  }
});

const getBusinessBranchesByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(parseInt(limit, 10) || 10, 100);
    const filter = { created_by: req.userIdNumber };
    if (status !== undefined) filter.Status = status === 'true';
    const sort = {}; sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (pageNumber - 1) * limitNumber;
    const [businessBranches, total] = await Promise.all([
      Business_Branch.find(filter)
        .sort(sort).skip(skip).limit(limitNumber),
      Business_Branch.countDocuments(filter)
    ]);

    const populatedBranches = await populateBusinessBranch(businessBranches);
    const totalPages = Math.ceil(total / limitNumber) || 1;
    const pagination = {
      currentPage: pageNumber,
      totalPages,
      totalItems: total,
      itemsPerPage: limitNumber,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1
    };
    console.info('Business Branches by authenticated user retrieved successfully', { total, page: pageNumber, limit: limitNumber, userId: req.userIdNumber });
    sendPaginated(res, populatedBranches, pagination, 'Business Branches retrieved successfully');
  } catch (error) {
    console.error('Error retrieving business branches by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getBranchTrackRanksCompetitors = asyncHandler(async (req, res) => {
  try {
    const { sortBy = 'OrderCount', sortOrder = 'desc' } = req.query;
    
    // Get all active branches
    const branches = await Business_Branch.find({ Status: true })
      .select('business_Branch_id firstName lastName BusinessName Address City_id State_id Country_id Status')
      .lean();
    
    // Get all restaurant items with branch mapping for order counting
    const restaurantItems = await Restaurant_Items.find({ Status: true })
      .select('Restaurant_Items_id business_Branch_id')
      .lean();
    
    // Create a map of item_id to branch_id for quick lookup
    const itemToBranchMap = {};
    restaurantItems.forEach(item => {
      itemToBranchMap[item.Restaurant_Items_id] = item.business_Branch_id;
    });
    
    // Get all orders
    const allOrders = await Order_Now.find({ Status: true })
      .select('Order_Now_id Product OrderStatus')
      .lean();
    
    // Calculate metrics for each branch
    const branchMetrics = await Promise.all(
      branches.map(async (branch) => {
        const branchId = branch.business_Branch_id;
        
        // Count orders: Orders where at least one product item belongs to this branch
        const orderCount = allOrders.filter(order => {
          return order.Product && order.Product.some(product => {
            const itemId = product.Item_id;
            return itemToBranchMap[itemId] === branchId;
          });
        }).length;
        
        // Count reviews
        const reviewCount = await Restaurant_Items_Reviews.countDocuments({
          business_Branch_id: branchId,
          Status: true
        });
        
        // Calculate earnings: Sum of completed transactions
        const earningsResult = await Transaction.aggregate([
          {
            $match: {
              business_Branch_id: branchId,
              Status: true,
              status: 'completed',
              transactionType: { $in: ['Order_Now_Payment', 'deposit', 'Recharge'] }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);
        const earning = earningsResult[0]?.total || 0;
        
        return {
          BranchId: branchId,
          BranchName: branch.BusinessName || `${branch.firstName || ''} ${branch.lastName || ''}`.trim() || 'Unnamed Branch',
          Address: branch.Address || '',
          City_id: branch.City_id || null,
          State_id: branch.State_id || null,
          Country_id: branch.Country_id || null,
          OrderCount: orderCount,
          ReviewCount: reviewCount,
          Earning: earning
        };
      })
    );
    
    // Sort the results
    const sortField = sortBy === 'OrderCount' ? 'OrderCount' : 
                     sortBy === 'ReviewCount' ? 'ReviewCount' : 
                     sortBy === 'Earning' ? 'Earning' : 'OrderCount';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    branchMetrics.sort((a, b) => {
      if (sortField === 'Earning') {
        return (b.Earning - a.Earning) * sortDirection;
      }
      return (b[sortField] - a[sortField]) * sortDirection;
    });
    
    const responseData = {
      getBranchlist: branchMetrics
    };
    
    console.info('Branch track ranks competitors retrieved successfully', { totalBranches: branchMetrics.length });
    sendSuccess(res, responseData, 'Branch track ranks competitors retrieved successfully');
  } catch (error) {
    console.error('Error retrieving branch track ranks competitors', { error: error.message, stack: error.stack });
    throw error;
  }
});

module.exports = {
  createBusinessBranch, 
  getAllBusinessBranches, 
  getBusinessBranchById, 
  updateBusinessBranch, 
  deleteBusinessBranch, 
  getBusinessBranchesByAuth,
  getBranchTrackRanksCompetitors
};

