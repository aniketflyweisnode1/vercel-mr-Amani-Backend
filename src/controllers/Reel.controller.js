const Reel = require('../models/Reel.model');
const Reel_Like = require('../models/Reel_Like.model');
const Reel_Comment = require('../models/Reel_Comment.model');
const Reel_share = require('../models/Reel_share.model');
const Reel_Follow = require('../models/Reel_Follow.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');


const normalizeToArray = (value) => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
};

/**
 * Populate reel with additional fields
 * @param {Array|Object} reels - Reel or array of reels
 * @param {Number} currentUserId - Current authenticated user ID (optional)
 * @returns {Promise<Array|Object>} - Populated reel(s)
 */
const populateReels = async (reels, currentUserId = null) => {
  const reelsArray = Array.isArray(reels) ? reels : [reels];
  
  const populatedReels = await Promise.all(
    reelsArray.map(async (reel) => {
      if (!reel) return null;
      
      const reelObj = reel.toObject ? reel.toObject() : reel;
      const reelId = reelObj.Real_Post_id;
      
      // Get counts
      const [totalLike, totalComment, totalShare] = await Promise.all([
        Reel_Like.countDocuments({ Real_Post_id: reelId, Status: true }),
        Reel_Comment.countDocuments({ Real_Post_id: reelId, Status: true }),
        Reel_share.countDocuments({ Real_Post_id: reelId, Status: true })
      ]);
      
      // Get sender information (created_by)
      let senderName = null;
      let senderLogo = null;
      let senderBio = null;
      let senderIsFollowed = false;
      
      if (reelObj.created_by) {
        const createdById = typeof reelObj.created_by === 'object' ? reelObj.created_by.user_id || reelObj.created_by : reelObj.created_by;
        const sender = await User.findOne({ user_id: createdById })
          .select('user_id firstName lastName BusinessName user_image Bio');
        
        if (sender) {
          senderName = sender.BusinessName || `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || null;
          senderLogo = sender.user_image || null;
          senderBio = sender.Bio || null;
        }
      }
      
      // Check if current user follows this reel
      if (currentUserId) {
        const followRecord = await Reel_Follow.findOne({
          Follow_by: currentUserId,
          Real_Post_id: reelId,
          Status: true
        });
        senderIsFollowed = !!followRecord;
      }
      
      // Add all the missing fields
      return {
        ...reelObj,
        PostType: reelObj.ReelType || 'Post', // Post Type (using ReelType field)
        TotalRemix: 0, // Total Remix (model doesn't exist, set to 0)
        TotalLike: totalLike, // Total Like count
        TotalComment: totalComment, // Total Comment count
        TotalGifts: 0, // Total Gifts (model doesn't exist, set to 0)
        TotalShare: totalShare, // Total Share count
        SenderName: senderName, // Sender Name
        SenderLogo: senderLogo, // Sender Logo
        SenderBio: senderBio, // Sender Bio
        SenderIsFollowed: senderIsFollowed, // Sender Is Followed
        ChallenName: null, // Challenge name (model doesn't exist, set to null)
        isProductToBuy: false // is Product to buy (no product link in model, set to false)
      };
    })
  );
  
  return Array.isArray(reels) ? populatedReels : populatedReels[0];
};

/**
 * Create a new reel
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createReel = asyncHandler(async (req, res) => {
  try {
    const postData = {
      ...req.body,
      created_by: req.userIdNumber || null
    };

    postData.image = normalizeToArray(postData.image);
    postData.VideoUrl = normalizeToArray(postData.VideoUrl);

    const post = await Reel.create(postData);

    console.info('Reel created successfully', { postId: post._id, Real_Post_id: post.Real_Post_id });

    sendSuccess(res, post, 'Reel created successfully', 201);
  } catch (error) {
    console.error('Error creating reel', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all reels with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllReels = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { Discription: { $regex: search, $options: 'i' } },
        { capiton: { $regex: search, $options: 'i' } },
        { hashtag: { $regex: search, $options: 'i' } },
        { Songs: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Reel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Reel.countDocuments(filter)
    ]);

    // Get current user ID from auth (if available)
    const currentUserId = req.userIdNumber || null;
    
    // Populate reels with additional fields
    const populatedPosts = await populateReels(posts, currentUserId);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };

    console.info('Reels retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, populatedPosts, pagination, 'Reels retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reels', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get reel by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReelById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a MongoDB ObjectId or Number ID
    let post;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      post = await Reel.findById(id);
    } else {
      // Number ID (Real_Post_id)
      const postId = parseInt(id, 10);
      if (isNaN(postId)) {
        return sendNotFound(res, 'Invalid reel ID format');
      }
      post = await Reel.findOne({ Real_Post_id: postId });
    }

    if (!post) {
      return sendNotFound(res, 'Reel not found');
    }

    // Get current user ID from auth (if available)
    const currentUserId = req.userIdNumber || null;
    
    // Populate reel with additional fields
    const populatedPost = await populateReels(post, currentUserId);

    console.info('Reel retrieved successfully', { postId: post._id });

    sendSuccess(res, populatedPost, 'Reel retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reel', { error: error.message, postId: req.params.id });
    throw error;
  }
});

/**
 * Update reel by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateReel = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };

    if (updateData.image !== undefined) {
      updateData.image = normalizeToArray(updateData.image);
    }
    if (updateData.VideoUrl !== undefined) {
      updateData.VideoUrl = normalizeToArray(updateData.VideoUrl);
    }

    // Check if id is a MongoDB ObjectId or Number ID
    let post;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      post = await Reel.findByIdAndUpdate(
        id,
        updateData,
        { 
          new: true, 
          runValidators: true
        }
      );
    } else {
      // Number ID (Real_Post_id)
      const postId = parseInt(id, 10);
      if (isNaN(postId)) {
        return sendNotFound(res, 'Invalid reel ID format');
      }
      post = await Reel.findOneAndUpdate(
        { Real_Post_id: postId },
        updateData,
        { 
          new: true, 
          runValidators: true
        }
      );
    }

    if (!post) {
      return sendNotFound(res, 'Reel not found');
    }

    console.info('Reel updated successfully', { postId: post._id });

    sendSuccess(res, post, 'Reel updated successfully');
  } catch (error) {
    console.error('Error updating reel', { error: error.message, postId: req.params.id });
    throw error;
  }
});

/**
 * Delete reel by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteReel = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a MongoDB ObjectId or Number ID
    let post;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      post = await Reel.findByIdAndUpdate(
        id,
        { 
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    } else {
      // Number ID (Real_Post_id)
      const postId = parseInt(id, 10);
      if (isNaN(postId)) {
        return sendNotFound(res, 'Invalid reel ID format');
      }
      post = await Reel.findOneAndUpdate(
        { Real_Post_id: postId },
        { 
          Status: false,
          updated_by: req.userIdNumber || null,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    if (!post) {
      return sendNotFound(res, 'Reel not found');
    }

    console.info('Reel deleted successfully', { postId: post._id });

    sendSuccess(res, post, 'Reel deleted successfully');
  } catch (error) {
    console.error('Error deleting reel', { error: error.message, postId: req.params.id });
    throw error;
  }
});

/**
 * Get all reels by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReelsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {
      created_by: req.userIdNumber
    };

    if (status !== undefined) {
      filter.Status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Reel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Reel.countDocuments(filter)
    ]);

    // Get current user ID from auth
    const currentUserId = req.userIdNumber || null;
    
    // Populate reels with additional fields
    const populatedPosts = await populateReels(posts, currentUserId);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };

    console.info('Reels by authenticated user retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit),
      userId: req.userIdNumber
    });

    sendPaginated(res, populatedPosts, pagination, 'Reels retrieved successfully');
  } catch (error) {
    console.error('Error retrieving reels by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createReel,
  getAllReels,
  getReelById,
  updateReel,
  deleteReel,
  getReelsByAuth
};

