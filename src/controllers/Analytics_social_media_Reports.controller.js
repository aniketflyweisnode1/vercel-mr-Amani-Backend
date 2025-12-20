const Reel = require('../models/Reel.model');
const Reel_Like = require('../models/Reel_Like.model');
const Reel_View = require('../models/Reel_View.model');
const Reel_Dislikes = require('../models/Reel_Dislikes.model');
const Reel_Reports = require('../models/Reel_Reports.model');
const Reel_Follow = require('../models/Reel_Follow.model');
const Reel_Comment = require('../models/Reel_Comment.model');
const Business_Branch = require('../models/business_Branch.model');
const Marketing_Promotions_EmailCampaign = require('../models/Marketing_Promotions_EmailCampaign.model');
const Marketing_Promotions_SMSCampaign = require('../models/Marketing_Promotions_SMSCampaign.model');
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

    // Calculate current month and last month dates
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Chart 1: EngagementBreakDown - Likes, Comments, Reposts, Saves
    // Get current month engagement
    const [currentLikes, currentComments, currentReposts, currentSaves] = await Promise.all([
      Reel_Like.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true,
        created_at: { $gte: currentMonth }
      }),
      Reel_Comment.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true,
        created_at: { $gte: currentMonth }
      }),
      // Reposts - using Reel_Follow as proxy (or create separate model)
      Reel_Follow.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true,
        created_at: { $gte: currentMonth }
      }),
      // Saves - using Reel_View as proxy for saves (or create separate model)
      Reel_View.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true,
        created_at: { $gte: currentMonth }
      })
    ]);

    // Get last month engagement
    const [lastLikes, lastComments, lastReposts, lastSaves] = await Promise.all([
      Reel_Like.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true,
        created_at: { $gte: lastMonth, $lt: currentMonth }
      }),
      Reel_Comment.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true,
        created_at: { $gte: lastMonth, $lt: currentMonth }
      }),
      Reel_Follow.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true,
        created_at: { $gte: lastMonth, $lt: currentMonth }
      }),
      Reel_View.countDocuments({
        Real_Post_id: { $in: reelIds },
        Status: true,
        created_at: { $gte: lastMonth, $lt: currentMonth }
      })
    ]);

    const totalEngagement = currentLikes + currentComments + currentReposts + currentSaves;
    const lastMonthTotal = lastLikes + lastComments + lastReposts + lastSaves;
    const lastMonthGrowth = lastMonthTotal > 0
      ? (((totalEngagement - lastMonthTotal) / lastMonthTotal) * 100).toFixed(2)
      : (totalEngagement > 0 ? 100 : 0);

    const engagementBreakDown = [
      {
        like: currentLikes,
        '%': totalEngagement > 0 ? ((currentLikes / totalEngagement) * 100).toFixed(2) : 0
      },
      {
        Comments: currentComments,
        '%': totalEngagement > 0 ? ((currentComments / totalEngagement) * 100).toFixed(2) : 0
      },
      {
        Reposts: currentReposts,
        '%': totalEngagement > 0 ? ((currentReposts / totalEngagement) * 100).toFixed(2) : 0
      },
      {
        saves: currentSaves,
        '%': totalEngagement > 0 ? ((currentSaves / totalEngagement) * 100).toFixed(2) : 0
      }
    ];

    // Chart 2: ContentTypePerformance - Viral, Banner, Email, sms_Text
    // Note: Adjust these based on your actual content type model/field
    // For now, using Reel model and assuming content type field exists or using views as proxy
    const viralCount = await Reel.countDocuments({
      Real_Post_id: { $in: reelIds },
      Status: true,
      created_at: { $gte: currentMonth }
      // Add content type filter if available: contentType: 'Viral'
    });

    const bannerCount = await Reel.countDocuments({
      Real_Post_id: { $in: reelIds },
      Status: true,
      created_at: { $gte: currentMonth }
      // Add content type filter if available: contentType: 'Banner'
    });

    const emailCount = await Marketing_Promotions_EmailCampaign.countDocuments({
      business_Branch_id: branchId,
      Status: true,
      created_at: { $gte: currentMonth }
    });

    const smsTextCount = await Marketing_Promotions_SMSCampaign.countDocuments({
      business_Branch_id: branchId,
      Status: true,
      created_at: { $gte: currentMonth }
    });

    const lastMonthViral = await Reel.countDocuments({
      Real_Post_id: { $in: reelIds },
      Status: true,
      created_at: { $gte: lastMonth, $lt: currentMonth }
    });

    const lastMonthBanner = await Reel.countDocuments({
      Real_Post_id: { $in: reelIds },
      Status: true,
      created_at: { $gte: lastMonth, $lt: currentMonth }
    });

    const lastMonthEmail = await Marketing_Promotions_EmailCampaign.countDocuments({
      business_Branch_id: branchId,
      Status: true,
      created_at: { $gte: lastMonth, $lt: currentMonth }
    });

    const lastMonthSMS = await Marketing_Promotions_SMSCampaign.countDocuments({
      business_Branch_id: branchId,
      Status: true,
      created_at: { $gte: lastMonth, $lt: currentMonth }
    });

    const contentTypePerformance = [
      {
        count: viralCount,
        Viral: viralCount
      },
      {
        count: bannerCount,
        Banner: bannerCount
      },
      {
        count: emailCount,
        Email: emailCount
      },
      {
        count: smsTextCount,
        sms_Text: smsTextCount
      }
    ];

    const contentTypeTotal = viralCount + bannerCount + emailCount + smsTextCount;
    const lastMonthContentTypeTotal = lastMonthViral + lastMonthBanner + lastMonthEmail + lastMonthSMS;
    const contentTypeLastMonthGrowth = lastMonthContentTypeTotal > 0
      ? (((contentTypeTotal - lastMonthContentTypeTotal) / lastMonthContentTypeTotal) * 100).toFixed(2)
      : (contentTypeTotal > 0 ? 100 : 0);

    // QuickInsights - Notification messages
    const quickInsights = [];
    
    if (likesCount > 0) {
      quickInsights.push(`You have ${likesCount} total likes on your content`);
    }
    if (viewsCount > 0) {
      quickInsights.push(`Your content has been viewed ${viewsCount} times`);
    }
    if (Comments > 0) {
      quickInsights.push(`You received ${Comments} comments on your posts`);
    }
    if (Flollowers > 0) {
      quickInsights.push(`You gained ${Flollowers} new followers`);
    }
    if (parseFloat(lastMonthGrowth) > 0) {
      quickInsights.push(`Your engagement increased by ${lastMonthGrowth}% compared to last month`);
    } else if (parseFloat(lastMonthGrowth) < 0) {
      quickInsights.push(`Your engagement decreased by ${Math.abs(parseFloat(lastMonthGrowth))}% compared to last month`);
    }
    if (reelIds.length > 0) {
      quickInsights.push(`You have ${reelIds.length} active posts`);
    }
    if (quickInsights.length === 0) {
      quickInsights.push('Start creating content to see insights');
    }

    const analyticsData = {
      likesCount,
      viewsCount,
      DislikesCount,
      Reports,
      Flollowers,
      Comments,
      charts: [
        {
          Name: 'EngagementBreakDown',
          LastmonthGrowth: parseFloat(lastMonthGrowth),
          data: engagementBreakDown
        },
        {
          Name: 'ContentTypePerformance',
          LastmonthGrowth: parseFloat(contentTypeLastMonthGrowth),
          data: contentTypePerformance
        }
      ],
      QuickInsights: quickInsights
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

