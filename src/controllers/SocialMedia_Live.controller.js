const SocialMediaLive = require('../models/SocialMedia_Live.model');
const Business_Branch = require('../models/business_Branch.model');
const Reel = require('../models/Reel.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const getBusinessBranchIdByAuth = async (userIdNumber) => {
  if (!userIdNumber) {
    return null;
  }
  const branch = await Business_Branch.findOne({ created_by: userIdNumber, Status: true });
  return branch ? branch.business_Branch_id : null;
};

const ensureBusinessBranchExists = async (business_Branch_id) => {
  if (business_Branch_id === undefined || business_Branch_id === null) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id, Status: true });
  return !!branch;
};

const ensureReelExists = async (Reel_Id) => {
  if (Reel_Id === undefined || Reel_Id === null) {
    return true;
  }
  const reel = await Reel.findOne({ Real_Post_id: Reel_Id, Status: true });
  return !!reel;
};

const buildReelPayloadFromLive = (payload, userIdNumber) => ({
  title: payload.liveSubject || 'Social Media Live',
  Discription: payload.liveDescription || '',
  ReelType: 'Live',
  Status: true,
  created_by: userIdNumber || null
});

const populateLive = (query) => query
  .populate('business_Branch_id', 'business_Branch_id BusinessName Address')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilterFromQuery = ({ search, status, business_Branch_id, Reel_Id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { liveSubject: { $regex: search, $options: 'i' } },
      { liveDescription: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (business_Branch_id !== undefined) {
    const numericBranch = parseInt(business_Branch_id, 10);
    if (!Number.isNaN(numericBranch)) {
      filter.business_Branch_id = numericBranch;
    }
  }

  if (Reel_Id !== undefined) {
    const numericReel = parseInt(Reel_Id, 10);
    if (!Number.isNaN(numericReel)) {
      filter.Reel_Id = numericReel;
    }
  }

  return filter;
};

const listLives = async ({ query, res, successMessage, filterOverrides = {} }) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status,
    business_Branch_id,
    Reel_Id,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = query;

  const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
  const numericPage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (numericPage - 1) * numericLimit;

  const filter = buildFilterFromQuery({ search, status, business_Branch_id, Reel_Id });
  Object.assign(filter, filterOverrides);

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [lives, total] = await Promise.all([
    populateLive(SocialMediaLive.find(filter))
      .sort(sort)
      .skip(skip)
      .limit(numericLimit),
    SocialMediaLive.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / numericLimit) || 1;
  const pagination = {
    currentPage: numericPage,
    totalPages,
    totalItems: total,
    itemsPerPage: numericLimit,
    hasNextPage: numericPage < totalPages,
    hasPrevPage: numericPage > 1
  };

  sendPaginated(res, lives, pagination, successMessage);
};

const findLiveByIdentifier = async (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populateLive(SocialMediaLive.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populateLive(SocialMediaLive.findOne({ SocialMedia_Live_id: numericId }));
  }

  return null;
};

const createSocialMediaLive = asyncHandler(async (req, res) => {
  try {
    let business_Branch_id = await getBusinessBranchIdByAuth(req.userIdNumber);

    if (!business_Branch_id) {
      return sendError(res, 'Unable to determine business branch for authenticated user', 400);
    }

    const branchExists = await ensureBusinessBranchExists(business_Branch_id);
    if (!branchExists) {
      return sendError(res, 'Business branch not found or inactive', 400);
    }

    const payload = {
      ...req.body,
      business_Branch_id,
      created_by: req.userIdNumber || null
    };

    const live = await SocialMediaLive.create(payload);

    const reel = await Reel.create(buildReelPayloadFromLive(payload, req.userIdNumber));
    await SocialMediaLive.findByIdAndUpdate(live._id, { Reel_Id: reel.Real_Post_id });

    const populated = await populateLive(SocialMediaLive.findById(live._id));

    sendSuccess(res, populated, 'Social media live created successfully', 201);
  } catch (error) {
    console.error('Error creating social media live', { error: error.message });
    throw error;
  }
});

const getAllSocialMediaLives = asyncHandler(async (req, res) => {
  try {
    await listLives({
      query: req.query,
      res,
      successMessage: 'Social media lives retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving social media lives', { error: error.message });
    throw error;
  }
});

const getSocialMediaLiveById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const liveQuery = await findLiveByIdentifier(id);

    if (!liveQuery) {
      return sendNotFound(res, 'Social media live not found');
    }

    const live = await liveQuery;
    if (!live) {
      return sendNotFound(res, 'Social media live not found');
    }

    sendSuccess(res, live, 'Social media live retrieved successfully');
  } catch (error) {
    console.error('Error retrieving social media live', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateSocialMediaLive = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.business_Branch_id !== undefined) {
      const branchExists = await ensureBusinessBranchExists(updateData.business_Branch_id);
      if (!branchExists) {
        return sendError(res, 'Business branch not found or inactive', 400);
      }
    }

    if (updateData.Reel_Id !== undefined) {
      const reelValid = await ensureReelExists(updateData.Reel_Id);
      if (!reelValid) {
        return sendError(res, 'Associated reel not found or inactive', 400);
      }
    }

    let live;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      live = await SocialMediaLive.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid social media live ID format', 400);
      }
      live = await SocialMediaLive.findOneAndUpdate(
        { SocialMedia_Live_id: numericId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!live) {
      return sendNotFound(res, 'Social media live not found');
    }

    const populated = await populateLive(SocialMediaLive.findById(live._id));
    sendSuccess(res, populated, 'Social media live updated successfully');
  } catch (error) {
    console.error('Error updating social media live', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteSocialMediaLive = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let live;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      live = await SocialMediaLive.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid social media live ID format', 400);
      }
      live = await SocialMediaLive.findOneAndUpdate(
        { SocialMedia_Live_id: numericId },
        updateData,
        { new: true }
      );
    }

    if (!live) {
      return sendNotFound(res, 'Social media live not found');
    }

    sendSuccess(res, live, 'Social media live deleted successfully');
  } catch (error) {
    console.error('Error deleting social media live', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getSocialMediaLivesByAuth = asyncHandler(async (req, res) => {
  try {
    await listLives({
      query: req.query,
      res,
      successMessage: 'Social media lives retrieved successfully',
      filterOverrides: { created_by: req.userIdNumber }
    });
  } catch (error) {
    console.error('Error retrieving social media lives by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getSocialMediaLivesByBranchId = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.params;
    const numericBranch = parseInt(business_Branch_id, 10);

    if (Number.isNaN(numericBranch)) {
      return sendError(res, 'Invalid business branch ID format', 400);
    }

    const branchExists = await ensureBusinessBranchExists(numericBranch);
    if (!branchExists) {
      return sendNotFound(res, 'Business branch not found');
    }

    await listLives({
      query: req.query,
      res,
      successMessage: 'Social media lives retrieved successfully',
      filterOverrides: { business_Branch_id: numericBranch }
    });
  } catch (error) {
    console.error('Error retrieving social media lives by branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

module.exports = {
  createSocialMediaLive,
  getAllSocialMediaLives,
  getSocialMediaLiveById,
  updateSocialMediaLive,
  deleteSocialMediaLive,
  getSocialMediaLivesByAuth,
  getSocialMediaLivesByBranchId
};

