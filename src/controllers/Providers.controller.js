const Providers = require('../models/Providers.model');
const Business_Branch = require('../models/business_Branch.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureStoreExists = async (StoreId) => {
  if (StoreId === undefined || StoreId === null) {
    return true; // StoreId is optional
  }
  const store = await Business_Branch.findOne({ business_Branch_id: StoreId, Status: true });
  return !!store;
};

// Manual population function for Number refs
const populateProviders = async (providers) => {
  const providersArray = Array.isArray(providers) ? providers : [providers];
  const populatedProviders = await Promise.all(
    providersArray.map(async (provider) => {
      if (!provider) return null;
      
      const providerObj = provider.toObject ? provider.toObject() : provider;
      
      // Populate StoreId
      if (providerObj.StoreId) {
        const storeId = typeof providerObj.StoreId === 'object' ? providerObj.StoreId : providerObj.StoreId;
        const store = await Business_Branch.findOne({ business_Branch_id: storeId })
          .select('business_Branch_id BusinessName Address');
        if (store) {
          providerObj.StoreId = store.toObject ? store.toObject() : store;
        }
      }
      
      // Populate created_by
      if (providerObj.created_by) {
        const createdById = typeof providerObj.created_by === 'object' ? providerObj.created_by : providerObj.created_by;
        const createdBy = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (createdBy) {
          providerObj.created_by = createdBy.toObject ? createdBy.toObject() : createdBy;
        }
      }
      
      // Populate updated_by
      if (providerObj.updated_by) {
        const updatedById = typeof providerObj.updated_by === 'object' ? providerObj.updated_by : providerObj.updated_by;
        const updatedBy = await User.findOne({ user_id: updatedById })
          .select('user_id firstName lastName phoneNo BusinessName');
        if (updatedBy) {
          providerObj.updated_by = updatedBy.toObject ? updatedBy.toObject() : updatedBy;
        }
      }
      
      return providerObj;
    })
  );
  
  return Array.isArray(providers) ? populatedProviders : populatedProviders[0];
};

const createProvider = asyncHandler(async (req, res) => {
  try {
    const { StoreId } = req.body;

    if (StoreId !== undefined && StoreId !== null) {
      const storeExists = await ensureStoreExists(StoreId);
      if (!storeExists) {
        return sendError(res, 'Associated store not found or inactive', 400);
      }
    }

    const providerData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    const provider = await Providers.create(providerData);
    console.info('Provider created successfully', { providerId: provider._id, Providers_id: provider.Providers_id });

    const populated = await populateProviders(provider);
    sendSuccess(res, populated, 'Provider created successfully', 201);
  } catch (error) {
    console.error('Error creating provider', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getAllProviders = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      StoreId,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { ProviderName: { $regex: search, $options: 'i' } },
        { ProviderStatus: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      if (typeof status === 'string') {
        filter.Status = status === 'true' || status === '1';
      } else {
        filter.Status = Boolean(status);
      }
    }

    if (StoreId) {
      const storeIdNum = parseInt(StoreId, 10);
      if (!isNaN(storeIdNum)) {
        filter.StoreId = storeIdNum;
      }
    }

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [providersData, total] = await Promise.all([
      Providers.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Providers.countDocuments(filter)
    ]);

    const providers = await populateProviders(providersData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Providers retrieved successfully', { total, page: numericPage });
    sendPaginated(res, providers, pagination, 'Providers retrieved successfully');
  } catch (error) {
    console.error('Error retrieving providers', { error: error.message, stack: error.stack });
    throw error;
  }
});

const getProviderById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let providerData;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      providerData = await Providers.findById(id);
    } else {
      const providerId = parseInt(id, 10);
      if (isNaN(providerId)) {
        return sendNotFound(res, 'Invalid provider ID format');
      }
      providerData = await Providers.findOne({ Providers_id: providerId });
    }

    if (!providerData) {
      return sendNotFound(res, 'Provider not found');
    }

    const provider = await populateProviders(providerData);
    console.info('Provider retrieved successfully', { id: providerData._id });
    sendSuccess(res, provider, 'Provider retrieved successfully');
  } catch (error) {
    console.error('Error retrieving provider', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateProvider = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.StoreId !== undefined && updateData.StoreId !== null) {
      const storeExists = await ensureStoreExists(updateData.StoreId);
      if (!storeExists) {
        return sendError(res, 'Associated store not found or inactive', 400);
      }
    }

    let provider;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      provider = await Providers.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const providerId = parseInt(id, 10);
      if (isNaN(providerId)) {
        return sendNotFound(res, 'Invalid provider ID format');
      }
      provider = await Providers.findOneAndUpdate({ Providers_id: providerId }, updateData, { new: true, runValidators: true });
    }

    if (!provider) {
      return sendNotFound(res, 'Provider not found');
    }

    const populated = await populateProviders(provider);
    console.info('Provider updated successfully', { id: provider._id });
    sendSuccess(res, populated, 'Provider updated successfully');
  } catch (error) {
    console.error('Error updating provider', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteProvider = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let provider;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      provider = await Providers.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const providerId = parseInt(id, 10);
      if (isNaN(providerId)) {
        return sendNotFound(res, 'Invalid provider ID format');
      }
      provider = await Providers.findOneAndUpdate({ Providers_id: providerId }, updateData, { new: true });
    }

    if (!provider) {
      return sendNotFound(res, 'Provider not found');
    }

    console.info('Provider deleted successfully', { id: provider._id });
    sendSuccess(res, provider, 'Provider deleted successfully');
  } catch (error) {
    console.error('Error deleting provider', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getProvidersByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      StoreId,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = { created_by: req.userIdNumber };

    if (search) {
      filter.$or = [
        { ProviderName: { $regex: search, $options: 'i' } },
        { ProviderStatus: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      if (typeof status === 'string') {
        filter.Status = status === 'true' || status === '1';
      } else {
        filter.Status = Boolean(status);
      }
    }

    if (StoreId) {
      const storeIdNum = parseInt(StoreId, 10);
      if (!isNaN(storeIdNum)) {
        filter.StoreId = storeIdNum;
      }
    }

    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [providersData, total] = await Promise.all([
      Providers.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(numericLimit),
      Providers.countDocuments(filter)
    ]);

    const providers = await populateProviders(providersData);

    const totalPages = Math.ceil(total / numericLimit) || 1;
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };

    console.info('Providers retrieved for authenticated user', { userId: req.userIdNumber, total });
    sendPaginated(res, providers, pagination, 'Providers retrieved successfully');
  } catch (error) {
    console.error('Error retrieving providers for authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createProvider,
  getAllProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
  getProvidersByAuth
};
