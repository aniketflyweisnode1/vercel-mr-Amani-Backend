const Reel = require('../models/Reel.model');
const User = require('../models/User.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Populate story with user data
 */
const populateStory = async (story) => {
  if (!story) return null;
  const storyObj = story.toObject ? story.toObject() : story;
  
  // Populate created_by
  if (storyObj.created_by) {
    const createdById = typeof storyObj.created_by === 'object' ? storyObj.created_by.user_id || storyObj.created_by : storyObj.created_by;
    const user = await User.findOne({ user_id: createdById })
      .select('user_id firstName lastName BusinessName Email phoneNo user_image Bio');
    if (user) {
      storyObj.created_by = user.toObject ? user.toObject() : user;
    }
  }
  
  return storyObj;
};

/**
 * Create a new story
 */
const createStory = asyncHandler(async (req, res) => {
  try {
    const storyData = {
      ...req.body,
      ReelType: 'Story', // Always set to Story
      created_by: req.userIdNumber || null
    };
    const story = await Reel.create(storyData);
    const populated = await populateStory(story);
    console.info('Story created successfully', { storyId: story._id, Real_Post_id: story.Real_Post_id });
    sendSuccess(res, populated, 'Story created successfully', 201);
  } catch (error) {
    console.error('Error creating story', { error: error.message });
    throw error;
  }
});

/**
 * Get all stories with pagination
 */
const getAllStories = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, user_id, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = { ReelType: 'Story' }; // Only stories
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { Discription: { $regex: search, $options: 'i' } },
        { capiton: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== undefined) filter.Status = status === 'true';
    if (user_id) filter.created_by = parseInt(user_id, 10);
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [stories, total] = await Promise.all([
      Reel.find(filter).sort(sort).skip(skip).limit(numericLimit),
      Reel.countDocuments(filter)
    ]);
    
    const populatedStories = await Promise.all(stories.map(story => populateStory(story)));
    
    const totalPages = Math.ceil(total / numericLimit);
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };
    
    console.info('Stories retrieved successfully', { total, page: numericPage, limit: numericLimit });
    sendPaginated(res, populatedStories, pagination, 'Stories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving stories', { error: error.message });
    throw error;
  }
});

/**
 * Get story by ID
 */
const getStoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let story;
    
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      story = await Reel.findOne({ _id: id, ReelType: 'Story' });
    } else {
      const storyId = parseInt(id, 10);
      if (isNaN(storyId)) return sendError(res, 'Invalid story ID format', 400);
      story = await Reel.findOne({ Real_Post_id: storyId, ReelType: 'Story' });
    }
    
    if (!story) return sendNotFound(res, 'Story not found');
    
    const populated = await populateStory(story);
    console.info('Story retrieved successfully', { storyId: story._id });
    sendSuccess(res, populated, 'Story retrieved successfully');
  } catch (error) {
    console.error('Error retrieving story', { error: error.message, id: req.params.id });
    throw error;
  }
});

/**
 * Update story
 */
const updateStory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      ReelType: 'Story', // Ensure it remains a Story
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    
    let story;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      story = await Reel.findOneAndUpdate(
        { _id: id, ReelType: 'Story' },
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      const storyId = parseInt(id, 10);
      if (isNaN(storyId)) return sendError(res, 'Invalid story ID format', 400);
      story = await Reel.findOneAndUpdate(
        { Real_Post_id: storyId, ReelType: 'Story' },
        updateData,
        { new: true, runValidators: true }
      );
    }
    
    if (!story) return sendNotFound(res, 'Story not found');
    
    const populated = await populateStory(story);
    console.info('Story updated successfully', { storyId: story._id });
    sendSuccess(res, populated, 'Story updated successfully');
  } catch (error) {
    console.error('Error updating story', { error: error.message, id: req.params.id });
    throw error;
  }
});

/**
 * Delete story (soft delete)
 */
const deleteStory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      Status: false,
      updated_by: req.userIdNumber || null,
      updated_at: new Date()
    };
    
    let story;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      story = await Reel.findOneAndUpdate(
        { _id: id, ReelType: 'Story' },
        updateData,
        { new: true }
      );
    } else {
      const storyId = parseInt(id, 10);
      if (isNaN(storyId)) return sendError(res, 'Invalid story ID format', 400);
      story = await Reel.findOneAndUpdate(
        { Real_Post_id: storyId, ReelType: 'Story' },
        updateData,
        { new: true }
      );
    }
    
    if (!story) return sendNotFound(res, 'Story not found');
    
    console.info('Story deleted successfully', { storyId: story._id });
    sendSuccess(res, story, 'Story deleted successfully');
  } catch (error) {
    console.error('Error deleting story', { error: error.message, id: req.params.id });
    throw error;
  }
});

/**
 * Get stories by authenticated user
 */
const getStoriesByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const filter = {
      ReelType: 'Story',
      created_by: req.userIdNumber
    };
    
    if (status !== undefined) filter.Status = status === 'true';
    
    const numericLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (numericPage - 1) * numericLimit;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const [stories, total] = await Promise.all([
      Reel.find(filter).sort(sort).skip(skip).limit(numericLimit),
      Reel.countDocuments(filter)
    ]);
    
    const populatedStories = await Promise.all(stories.map(story => populateStory(story)));
    
    const totalPages = Math.ceil(total / numericLimit);
    const pagination = {
      currentPage: numericPage,
      totalPages,
      totalItems: total,
      itemsPerPage: numericLimit,
      hasNextPage: numericPage < totalPages,
      hasPrevPage: numericPage > 1
    };
    
    console.info('Stories by authenticated user retrieved successfully', { total, userId: req.userIdNumber });
    sendPaginated(res, populatedStories, pagination, 'Stories retrieved successfully');
  } catch (error) {
    console.error('Error retrieving stories by authenticated user', { error: error.message, userId: req.userIdNumber });
    throw error;
  }
});

module.exports = {
  createStory,
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory,
  getStoriesByAuth
};

