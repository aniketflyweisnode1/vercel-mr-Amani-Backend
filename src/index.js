const express = require('express');
const router = express.Router();

// Import route modules
const LoginRoutes = require('./routes/Authentication/Login.routes.js');
const UserRoutes = require('./routes/User/user.js');
const ReelRoutes = require('./routes/SocialMedia/Reel.routes');
const Reel_ViewRoutes = require('./routes/SocialMedia/Reel_View.routes');
const Reel_FollowRoutes = require('./routes/SocialMedia/Reel_Follow.routes');
const Reel_LikeRoutes = require('./routes/SocialMedia/Reel_Like.routes');
const Reel_shareRoutes = require('./routes/SocialMedia/Reel_share.routes');
const Reel_CommentRoutes = require('./routes/SocialMedia/Reel_Comment.routes');
const Reel_Add_UserRoutes = require('./routes/SocialMedia/Reel_Add_User.routes');
const Room_CategoriesRoutes = require('./routes/SocialMedia/Room_Categories.routes');
const RoomsRoutes = require('./routes/SocialMedia/Rooms.routes');
const Room_JoinRoutes = require('./routes/SocialMedia/Room_Join.routes');
const ProfilePageRoutes = require('./routes/SocialMedia/ProfilePage.routes');
const InfluencerRoutes = require('./routes/SocialMedia/Influencer.routes');
// Import Master routes
const RoleRoutes = require('./routes/Master/Role.routes');
const ServicesRoutes = require('./routes/Master/Services.routes');
const CategoryRoutes = require('./routes/Master/Category.routes');
const SubCategoryRoutes = require('./routes/Master/SubCategory.routes');
const CountryRoutes = require('./routes/Master/Country.routes');
const StateRoutes = require('./routes/Master/State.routes');
const CityRoutes = require('./routes/Master/City.routes');
const Privacy_PolicyRoutes = require('./routes/Master/Privacy_Policy.routes');
const LanguageRoutes = require('./routes/Master/Language.routes');
const Help_FeedbackRoutes = require('./routes/Master/Help_Feedback.routes');
const faqRoutes = require('./routes/Master/faq.routes');
const ContactUsRoutes = require('./routes/Master/ContactUs.routes');
const WalletRoutes = require('./routes/Master/Wallet.routes');
const BankRoutes = require('./routes/Master/Bank.routes');
const NotificationTypeRoutes = require('./routes/Master/Notification_type.routes');
const NotificationRoutes = require('./routes/Master/Notification.routes');

const { sendSuccess } = require('../utils/response');

/**
 * @route   GET /api
 * @desc    API health check
 * @access  Public
 */

router.get('/', (req, res) => {
  sendSuccess(res, {
    message: 'Welcome to Node.js API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  }, 'API is running successfully');
});

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */

router.get('/health', (req, res) => {
  sendSuccess(res, {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    environment: 'development'
  }, 'Health check passed');
});

router.use('/authentication', LoginRoutes);
router.use('/user', UserRoutes);
router.use('/Reel', ReelRoutes);
router.use('/Reel_View', Reel_ViewRoutes);
router.use('/Reel_Follow', Reel_FollowRoutes);
router.use('/Reel_Like', Reel_LikeRoutes);
router.use('/Reel_share', Reel_shareRoutes);
router.use('/Reel_Comment', Reel_CommentRoutes);
router.use('/Reel_Add_User', Reel_Add_UserRoutes);
router.use('/Room_Categories', Room_CategoriesRoutes);
router.use('/Rooms', RoomsRoutes);
router.use('/Room_Join', Room_JoinRoutes);
router.use('/ProfilePage', ProfilePageRoutes);
router.use('/Influencer', InfluencerRoutes);
router.use('/Role', RoleRoutes);
router.use('/Services', ServicesRoutes);
router.use('/Category', CategoryRoutes);
router.use('/SubCategory', SubCategoryRoutes);
router.use('/Country', CountryRoutes);
router.use('/State', StateRoutes);
router.use('/City', CityRoutes);
router.use('/Privacy_Policy', Privacy_PolicyRoutes);
router.use('/Language', LanguageRoutes);
router.use('/Help_Feedback', Help_FeedbackRoutes);
router.use('/faq', faqRoutes);
router.use('/ContactUs', ContactUsRoutes);
router.use('/Wallet', WalletRoutes);
router.use('/Bank', BankRoutes);
router.use('/Notification_type', NotificationTypeRoutes);
router.use('/Notification', NotificationRoutes);

module.exports = router;
