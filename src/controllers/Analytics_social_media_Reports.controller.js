const Reel = require('../models/Reel.model');
const Reel_Like = require('../models/Reel_Like.model');
const Reel_View = require('../models/Reel_View.model');
const Reel_Dislikes = require('../models/Reel_Dislikes.model');
const Reel_Reports = require('../models/Reel_Reports.model');
const Reel_Follow = require('../models/Reel_Follow.model');
const Reel_Comment = require('../models/Reel_Comment.model');
const Business_Branch = require('../models/business_Branch.model');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ensureBranchExists = async (business_Branch_id) => {
  if (business_Branch_id === undefined) {
    return false;
  }
  const branchId = parseInt(business_Branch_id, 10);
  if (Number.isNaN(branchId)) {
    return false;
  }
  const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
  return Boolean(branch);
};

const getAnalyticsSocialMediaReports = asyncHandler(async (req, res) => {
  try {
    const { business_Branch_id } = req.query;

    if (!business_Branch_id) {
      return sendError(res, 'Business branch ID is required', 400);
    }

    const branchId = parseInt(business_Branch_id, 10);
    if (Number.isNaN(branchId)) {
      return sendError(res, 'Invalid business branch ID format', 400);
    }

    if (!(await ensureBranchExists(branchId))) {
      return sendError(res, 'Business branch not found', 404);
    }

    // Get the branch to find associated user IDs
    const branch = await Business_Branch.findOne({ business_Branch_id: branchId, Status: true });
    if (!branch) {
      return sendError(res, 'Business branch not found', 404);
    }

    // Find all reels created by users associated with this branch
    // Option 1: Reels created by the user who created the branch
    // Option 2: Reels where created_by matches users associated with the branch
    // For now, we'll get reels created by the branch creator
    const branchCreatorId = branch.created_by;

    // Get all reel IDs for reels created by users associated with this branch
    // We'll include reels created by the branch creator
    const reels = await Reel.find({
      created_by: branchCreatorId,
      Status: true
    }).select('Real_Post_id');

    const reelIds = reels.map(reel => reel.Real_Post_id);

    // If no reels found, return zero counts
    if (reelIds.length === 0) {
      return sendSuccess(res, {
        likesCount: 0,
        viewsCount: 0,
        DislikesCount: 0,
        Reports: 0,
        Flollowers: 0,
        Comments: 0
      }, 'Analytics social media reports retrieved successfully');
    }

    // Count all interactions for these reels
    const [likesCount, viewsCount, DislikesCount, Reports, Flollowers, Comments] = await Promise.all([
      Reel_Like.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true
      }),
      Reel_View.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true
      }),
      Reel_Dislikes.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true
      }),
      Reel_Reports.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true
      }),
      Reel_Follow.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true
      }),
      Reel_Comment.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true
      })
    ]);

    const analyticsData = {
      likesCount,
      viewsCount,
      DislikesCount,
      Reports,
      Flollowers,
      Comments
    };

    sendSuccess(res, analyticsData, 'Analytics social media reports retrieved successfully');
  } catch (error) {
    console.error('Error retrieving analytics social media reports', { error: error.message });
    throw error;
  }
});

module.exports = {
  getAnalyticsSocialMediaReports
};

