const SocialMediaPost = require('../models/SocialMedia_Post.model');
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

const buildReelPayloadFromPost = (payload, userIdNumber) => ({
  title: payload.Caption || payload.Content || 'Social Media Post',
  Discription: payload.Description || payload.Content || '',
  image: payload.image_Video ? [payload.image_Video] : [],
  VideoUrl: payload.image_Video ? [payload.image_Video] : [],
  Coverimage: payload.image_Video || '',
  Songs: Array.isArray(payload.Music) && payload.Music.length > 0 ? payload.Music[0] : '',
  capiton: payload.Caption || '',
  hashtag: Array.isArray(payload.Tag) ? payload.Tag.join(',') : '',
  ReelType: 'Post',
  Status: true,
  created_by: userIdNumber || null
});

const populatePost = (query) => query
  .populate('business_Branch_id', 'business_Branch_id BusinessName Address')
  .populate('created_by', 'firstName lastName phoneNo BusinessName')
  .populate('updated_by', 'firstName lastName phoneNo BusinessName');

const buildFilterFromQuery = ({ search, status, business_Branch_id, ScheduleLater, Reel_Id }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { Content: { $regex: search, $options: 'i' } },
      { Caption: { $regex: search, $options: 'i' } },
      { Description: { $regex: search, $options: 'i' } },
      { Tag: { $regex: search, $options: 'i' } },
      { Music: { $regex: search, $options: 'i' } }
    ];
  }

  if (status !== undefined) {
    filter.Status = status === 'true' || status === true;
  }

  if (ScheduleLater !== undefined) {
    filter.ScheduleLater = ScheduleLater === 'true' || ScheduleLater === true;
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

const listPosts = async ({ query, res, successMessage, filterOverrides = {} }) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status,
    business_Branch_id,
    ScheduleLater,
    Reel_Id,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = query;

  const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
  const numericPage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (numericPage - 1) * numericLimit;

  const filter = buildFilterFromQuery({ search, status, business_Branch_id, ScheduleLater, Reel_Id });
  Object.assign(filter, filterOverrides);

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [posts, total] = await Promise.all([
    populatePost(SocialMediaPost.find(filter))
      .sort(sort)
      .skip(skip)
      .limit(numericLimit),
    SocialMediaPost.countDocuments(filter)
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

  sendPaginated(res, posts, pagination, successMessage);
};

const findPostByIdentifier = async (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return populatePost(SocialMediaPost.findById(identifier));
  }

  const numericId = parseInt(identifier, 10);
  if (!Number.isNaN(numericId)) {
    return populatePost(SocialMediaPost.findOne({ SocialMedia_Post_id: numericId }));
  }

  return null;
};

const createSocialMediaPost = asyncHandler(async (req, res) => {
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

    const post = await SocialMediaPost.create(payload);

    const reel = await Reel.create(buildReelPayloadFromPost(payload, req.userIdNumber));
    await SocialMediaPost.findByIdAndUpdate(post._id, { Reel_Id: reel.Real_Post_id });

    const populated = await populatePost(SocialMediaPost.findById(post._id));

    sendSuccess(res, populated, 'Social media post created successfully', 201);
  } catch (error) {
    console.error('Error creating social media post', { error: error.message });
    throw error;
  }
});

const getAllSocialMediaPosts = asyncHandler(async (req, res) => {
  try {
    await listPosts({
      query: req.query,
      res,
      successMessage: 'Social media posts retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving social media posts', { error: error.message });
    throw error;
  }
});

const getSocialMediaPostById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const postQuery = await findPostByIdentifier(id);

    if (!postQuery) {
      return sendNotFound(res, 'Social media post not found');
    }

    const post = await postQuery;
    if (!post) {
      return sendNotFound(res, 'Social media post not found');
    }

    sendSuccess(res, post, 'Social media post retrieved successfully');
  } catch (error) {
    console.error('Error retrieving social media post', { error: error.message, id: req.params.id });
    throw error;
  }
});

const updateSocialMediaPost = asyncHandler(async (req, res) => {
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

    let post;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      post = await SocialMediaPost.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid social media post ID format', 400);
      }
      post = await SocialMediaPost.findOneAndUpdate(
        { SocialMedia_Post_id: numericId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!post) {
      return sendNotFound(res, 'Social media post not found');
    }

    const populated = await populatePost(SocialMediaPost.findById(post._id));
    sendSuccess(res, populated, 'Social media post updated successfully');
  } catch (error) {
    console.error('Error updating social media post', { error: error.message, id: req.params.id });
    throw error;
  }
});

const deleteSocialMediaPost = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    let post;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      post = await SocialMediaPost.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) {
        return sendError(res, 'Invalid social media post ID format', 400);
      }
      post = await SocialMediaPost.findOneAndUpdate(
        { SocialMedia_Post_id: numericId },
        updateData,
        { new: true }
      );
    }

    if (!post) {
      return sendNotFound(res, 'Social media post not found');
    }

    sendSuccess(res, post, 'Social media post deleted successfully');
  } catch (error) {
    console.error('Error deleting social media post', { error: error.message, id: req.params.id });
    throw error;
  }
});

const getSocialMediaPostsByAuth = asyncHandler(async (req, res) => {
  try {
    await listPosts({
      query: req.query,
      res,
      successMessage: 'Social media posts retrieved successfully',
      filterOverrides: { created_by: req.userIdNumber }
    });
  } catch (error) {
    console.error('Error retrieving social media posts by auth', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

const getSocialMediaPostsByBranchId = asyncHandler(async (req, res) => {
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

    await listPosts({
      query: req.query,
      res,
      successMessage: 'Social media posts retrieved successfully',
      filterOverrides: { business_Branch_id: numericBranch }
    });
  } catch (error) {
    console.error('Error retrieving social media posts by branch ID', { error: error.message, business_Branch_id: req.params.business_Branch_id });
    throw error;
  }
});

module.exports = {
  createSocialMediaPost,
  getAllSocialMediaPosts,
  getSocialMediaPostById,
  updateSocialMediaPost,
  deleteSocialMediaPost,
  getSocialMediaPostsByAuth,
  getSocialMediaPostsByBranchId
};

