const UserAddress = require('../models/user_Address.model');
const City = require('../models/city.model');
const State = require('../models/state.model');
const Country = require('../models/country.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

// Manual population function for Number refs

const populateUserAddressData = async (addresses) => {
  const addressesArray = Array.isArray(addresses) ? addresses : [addresses];
  const populatedAddresses = await Promise.all(
    addressesArray.map(async (address) => {
      const addressObj = address.toObject ? address.toObject() : address;
      
      // Populate City
      if (addressObj.City) {
        const city = await City.findOne({ city_id: addressObj.City });
        if (city) {
          addressObj.City = city.toObject ? city.toObject() : city;
        }
      }
      
      // Populate State
      if (addressObj.State) {
        const state = await State.findOne({ state_id: addressObj.State });
        if (state) {
          addressObj.State = state.toObject ? state.toObject() : state;
        }
      }
      
      // Populate Country
      if (addressObj.Country) {
        const country = await Country.findOne({ country_id: addressObj.Country });
        if (country) {
          addressObj.Country = country.toObject ? country.toObject() : country;
        }
      }
      
      // Populate user_id
      if (addressObj.user_id) {
        const userId = typeof addressObj.user_id === 'object' ? addressObj.user_id : addressObj.user_id;
        const user = await User.findOne({ user_id: userId });
        if (user) {
          addressObj.user_id = user.toObject ? user.toObject() : user;
        }
      }
      
      // Populate created_by
      if (addressObj.created_by) {
        const createdById = typeof addressObj.created_by === 'object' ? addressObj.created_by : addressObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById });
        if (createdBy) {
          addressObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (addressObj.updated_by) {
        const updatedById = typeof addressObj.updated_by === 'object' ? addressObj.updated_by : addressObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById });
        if (updatedBy) {
          addressObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return addressObj;
    })
  );
  
  return Array.isArray(addresses) ? populatedAddresses : populatedAddresses[0];
};

const buildFilter = ({ search, status, user_id, City, State, Country, setDefult }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { GoogleAddress: { $regex: search, $options: 'i' } },
      { Address: { $regex: search, $options: 'i' } },
      { zipcode: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (user_id !== undefined) {
    const userId = parseInt(user_id, 10);
    if (!Number.isNaN(userId)) {
      filter.user_id = userId;
    }
  }

  if (City !== undefined) {
    const cityId = parseInt(City, 10);
    if (!Number.isNaN(cityId)) {
      filter.City = cityId;
    }
  }

  if (State !== undefined) {
    const stateId = parseInt(State, 10);
    if (!Number.isNaN(stateId)) {
      filter.State = stateId;
    }
  }

  if (Country !== undefined) {
    const countryId = parseInt(Country, 10);
    if (!Number.isNaN(countryId)) {
      filter.Country = countryId;
    }
  }

  if (setDefult !== undefined) {
    filter.setDefult = setDefult === 'true' || setDefult === true;
  }

  return filter;
};

const paginateMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

const ensureCityExists = async (cityIdValue) => {
  if (cityIdValue === undefined || cityIdValue === null) {
    return true;
  }
  const cityId = parseInt(cityIdValue, 10);
  if (Number.isNaN(cityId)) {
    return false;
  }
  const city = await City.findOne({ city_id: cityId });
  return Boolean(city);
};

const ensureStateExists = async (stateIdValue) => {
  if (stateIdValue === undefined || stateIdValue === null) {
    return true;
  }
  const stateId = parseInt(stateIdValue, 10);
  if (Number.isNaN(stateId)) {
    return false;
  }
  const state = await State.findOne({ state_id: stateId });
  return Boolean(state);
};

const ensureCountryExists = async (countryIdValue) => {
  if (countryIdValue === undefined || countryIdValue === null) {
    return true;
  }
  const countryId = parseInt(countryIdValue, 10);
  if (Number.isNaN(countryId)) {
    return false;
  }
  const country = await Country.findOne({ country_id: countryId });
  return Boolean(country);
};

const findByIdentifier = (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return UserAddress.findById(identifier);
  }
  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return UserAddress.findOne({ User_Address_id: numericId });
  }
  return null;
};

const createUserAddress = asyncHandler(async (req, res) => {
  try {
    const { City, State, Country, setDefult } = req.body;
    
    if (City !== undefined && City !== null && !(await ensureCityExists(City))) {
      return sendError(res, 'City not found', 400);
    }
    
    if (State !== undefined && State !== null && !(await ensureStateExists(State))) {
      return sendError(res, 'State not found', 400);
    }
    
    if (Country !== undefined && Country !== null && !(await ensureCountryExists(Country))) {
      return sendError(res, 'Country not found', 400);
    }
    
    // If setting as default, unset other default addresses for this user
    if (setDefult === true) {
      await UserAddress.updateMany(
        { user_id: req.userIdNumber, setDefult: true },
        { setDefult: false, updated_at: new Date() }
      );
    }
    
    const payload = {
      ...req.body,
      user_id: req.userIdNumber || null, // Set from login user id
      created_by: req.userIdNumber || null
    };
    const address = await UserAddress.create(payload);
    const populated = await populateUserAddressData(address);
    sendSuccess(res, populated, 'User address created successfully', 201);
  } catch (error) {
    console.error('Error creating user address', { error: error.message });
    throw error;
  }
});

const getAllUserAddresses = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      City,
      State,
      Country,
      setDefult,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, user_id, City, State, Country, setDefult });
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [addresses, total] = await Promise.all([
      UserAddress.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      UserAddress.countDocuments(filter)
    ]);
    const populatedAddresses = await populateUserAddressData(addresses);
    sendPaginated(res, populatedAddresses, paginateMeta(numericPage, numericLimit, total), 'User addresses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving user addresses', { error: error.message });
    throw error;
  }
});

const getUserAddressById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const addressQuery = findByIdentifier(id);
    if (!addressQuery) {
      return sendError(res, 'Invalid user address identifier', 400);
    }
    const address = await addressQuery;
    if (!address) {
      return sendNotFound(res, 'User address not found');
    }
    const populated = await populateUserAddressData(address);
    sendSuccess(res, populated, 'User address retrieved successfully');
  } catch (error) {
    console.error('Error retrieving user address', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateUserAddress = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { City, State, Country, setDefult } = req.body;
    
    if (City !== undefined && City !== null && !(await ensureCityExists(City))) {
      return sendError(res, 'City not found', 400);
    }
    
    if (State !== undefined && State !== null && !(await ensureStateExists(State))) {
      return sendError(res, 'State not found', 400);
    }
    
    if (Country !== undefined && Country !== null && !(await ensureCountryExists(Country))) {
      return sendError(res, 'Country not found', 400);
    }
    
    // If setting as default, unset other default addresses for this user
    if (setDefult === true) {
      const currentAddress = await findByIdentifier(id);
      if (currentAddress) {
        await UserAddress.updateMany(
          { 
            user_id: currentAddress.user_id || req.userIdNumber, 
            setDefult: true,
            User_Address_id: { $ne: id.match(/^\d+$/) ? parseInt(id, 10) : null }
          },
          { setDefult: false, updated_at: new Date() }
        );
      }
    }
    
    const updatePayload = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let address;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      address = await UserAddress.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid user address ID format', 400);
      }
      address = await UserAddress.findOneAndUpdate({ User_Address_id: numericId }, updatePayload, { new: true, runValidators: true });
    }
    if (!address) {
      return sendNotFound(res, 'User address not found');
    }
    const populated = await populateUserAddressData(address);
    sendSuccess(res, populated, 'User address updated successfully');
  } catch (error) {
    console.error('Error updating user address', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteUserAddress = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    let address;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      address = await UserAddress.findByIdAndUpdate(id, updatePayload, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid user address ID format', 400);
      }
      address = await UserAddress.findOneAndUpdate({ User_Address_id: numericId }, updatePayload, { new: true });
    }
    if (!address) {
      return sendNotFound(res, 'User address not found');
    }
    sendSuccess(res, address, 'User address deleted successfully');
  } catch (error) {
    console.error('Error deleting user address', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getUserAddressesByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      City,
      State,
      Country,
      setDefult,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    const filter = buildFilter({ search, status, City, State, Country, setDefult });
    filter.user_id = req.userIdNumber || null;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [addresses, total] = await Promise.all([
      UserAddress.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      UserAddress.countDocuments(filter)
    ]);
    const populatedAddresses = await populateUserAddressData(addresses);
    sendPaginated(res, populatedAddresses, paginateMeta(numericPage, numericLimit, total), 'User addresses retrieved successfully');
  } catch (error) {
    console.error('Error retrieving user addresses by auth', { error: error.message });
    throw error;
  }
});

module.exports = {
  createUserAddress,
  getAllUserAddresses,
  getUserAddressById,
  updateUserAddress,
  deleteUserAddress,
  getUserAddressesByAuth
};

