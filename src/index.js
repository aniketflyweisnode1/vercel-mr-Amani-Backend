const express = require('express');
const router = express.Router();

// Import route modules
const LoginRoutes = require('./routes/Authentication/Login.routes.js');
const UserRoutes = require('./routes/User/user.js');
const DasboardListRoutes = require('./routes/User/DasboardList.routes');
const ReelRoutes = require('./routes/SocialMedia/Reel.routes');
const Reel_ViewRoutes = require('./routes/SocialMedia/Reel_View.routes');
const Reel_FollowRoutes = require('./routes/SocialMedia/Reel_Follow.routes');
const Reel_LikeRoutes = require('./routes/SocialMedia/Reel_Like.routes');
const Reel_shareRoutes = require('./routes/SocialMedia/Reel_share.routes');
const Reel_CommentRoutes = require('./routes/SocialMedia/Reel_Comment.routes');
const Reel_ReportsRoutes = require('./routes/SocialMedia/Reel_Reports.routes');
const Reel_DislikesRoutes = require('./routes/SocialMedia/Reel_Dislikes.routes');
const Reel_Add_UserRoutes = require('./routes/SocialMedia/Reel_Add_User.routes');
const Room_CategoriesRoutes = require('./routes/SocialMedia/Room_Categories.routes');
const RoomsRoutes = require('./routes/SocialMedia/Rooms.routes');
const Room_JoinRoutes = require('./routes/SocialMedia/Room_Join.routes');
const ProfilePageRoutes = require('./routes/SocialMedia/ProfilePage.routes');
const InfluencerRoutes = require('./routes/SocialMedia/Influencer.routes');
const EffectsCategorysRoutes = require('./routes/SocialMedia/Effects_Categorys.routes');
const EffectsRoutes = require('./routes/SocialMedia/Effects.routes');
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
const ItemTypeRoutes = require('./routes/User/Shopping_Deals/Item_type.routes');
const GiftCardsTypeRoutes = require('./routes/Master/GiftCards_type.routes');
const GiftCardsRoutes = require('./routes/Master/GiftCards.routes');
const ItemCategoryRoutes = require('./routes/User/Shopping_Deals/item_Category.routes');
const RewardsTypeRoutes = require('./routes/Master/Rewards_type.routes');
const RewardsRoutes = require('./routes/Master/Rewards.routes');
const PlanRoutes = require('./routes/Master/Plan.routes');
const PaymentMethodRoutes = require('./routes/Master/payment_method.routes');
const TransactionRoutes = require('./routes/Master/transaction.routes');
const SubscriptionRoutes = require('./routes/Master/subscription.routes');
const BusinessTypeRoutes = require('./routes/Master/businessType.routes');
const BusinessDetailsRoutes = require('./routes/Master/Business_Details.routes');
const BusinessBranchRoutes = require('./routes/Master/business_Branch.routes');
const CampaignTypeRoutes = require('./routes/Master/CampaignType.routes');
const ClosingDaysRoutes = require('./routes/Restaurant/closing_days.routes');
const ContactSupportRoutes = require('./routes/Restaurant/ContactSupport.routes.js');
const ReportAnIssueRoutes = require('./routes/Restaurant/ReportAnIssue.routes.js');
const CustomerRoutes = require('./routes/Restaurant/Customer.routes');
const GiftCardsMapRoutes = require('./routes/User/GiftCards_Map.routes');
const RewardsMapRoutes = require('./routes/User/Rewards_Map.routes');
const MyFavoritesRoutes = require('./routes/User/myFavorites.routes');
const OrderFoodMyFavoritesRoutes = require('./routes/User/Order_Food/MyFavorites.routes');
const OrderFoodRoutes = require('./routes/User/Order_Food/orderFood.routes');
const CartRoutes = require('./routes/User/Cart.routes');
const UserAddressRoutes = require('./routes/User/User_Address.routes');
const OrderNowRoutes = require('./routes/User/Order_Now.routes');  // User Order Food Routes
const ReferralRoutes = require('./routes/User/Order_Food/Referral.routes');
const OrderHistoryRoutes = require('./routes/User/Order_History.routes');  // User Order Food Routes
const DeliveryRoutes = require('./routes/User/Delivery.routes');
const ProfileSettingRoutes = require('./routes/User/Order_Food/Profile_setting.routes');
const CateringEventTypeRoutes = require('./routes/User/Order_Food/Catering/Catering_EventType.routes');
const CateringEventRoutes = require('./routes/User/Order_Food/Catering/Catering_Event.routes');
const CateringTypeRoutes = require('./routes/User/Order_Food/Catering/Catering_Type.routes');
const CateringRoutes = require('./routes/User/Order_Food/Catering/Catering.routes');
const FoodTruckCateringRoutes = require('./routes/User/Order_Food/Food_Truck_ForEvent/Food_Truck_Catering.routes');
const GroceryCategoriesRoutes = require('./routes/User/Grocery_Essentials/Grocery_Categories.routes');
const GroceryCategoriesTypeRoutes = require('./routes/User/Grocery_Essentials/Grocery_Categories_type.routes');
const GroceryItemsRoutes = require('./routes/User/Grocery_Essentials/Grocery_Items.routes');
const FoodTruckVendingRoutes = require('./routes/User/Order_Food/Food_Truck_ForEvent/Food_Truck_Vending.routes');
const ScheduleMeetingRoutes = require('./routes/User/Order_Food/Food_Truck_ForEvent/Schedule_Meeting.routes');
// Import Restaurant routes
const DiscountsTypeRoutes = require('./routes/Restaurant/Discounts_type.routes');
const DiscountsRoutes = require('./routes/Restaurant/Discounts.routes');
const DiscountsMapUserRoutes = require('./routes/Restaurant/Discounts_Map_User.routes');
const ServiceChargesTypeRoutes = require('./routes/Restaurant/ServiceCharges_type.routes');
const ServiceRestaurantRoutes = require('./routes/Restaurant/Service_Restaurant.routes');
const ServiceChargesRoutes = require('./routes/Restaurant/ServiceCharges.routes');
const FavouritesRoutes = require('./routes/Restaurant/Favourites.routes');
const WorkingHoursRoutes = require('./routes/Restaurant/Working_Hours.routes');
const DepartmentsRoutes = require('./routes/Restaurant/Departments.routes');
const WorkForceEmployeeRoutes = require('./routes/Restaurant/WorkForceManagement_Employee.routes');
const ScheduleOnlyMeRoutes = require('./routes/Restaurant/WorkForceManagement_Schedule_Onlyme.routes');
const ScheduleEveryOneRoutes = require('./routes/Restaurant/WorkForceManagement_Schedule_EveryOne.routes');
const ScheduleMyAvailabilityRoutes = require('./routes/Restaurant/WorkForceManagement_Schedule_Myavailability.routes');
const ExpensesRoutes = require('./routes/Restaurant/Expenses.routes');
const BranchMapBankRoutes = require('./routes/Restaurant/Branch_map_Bank.routes');
const FinanceRoutes = require('./routes/Restaurant/Finance.routes');
const MarketingCouponCategoryRoutes = require('./routes/Restaurant/Marketing_Promotions_coupon_Category.routes');
const MarketingCouponRoutes = require('./routes/Restaurant/Marketing_Promotions_coupon.routes');
const CampaignAllneedaPostRoutes = require('./routes/Restaurant/CampaignAllneedaPost.routes');
const SocialMediaPostRoutes = require('./routes/Restaurant/SocialMedia_Post.routes');
const SocialMediaLiveRoutes = require('./routes/Restaurant/SocialMedia_Live.routes');
const MarketingEmailCampaignRoutes = require('./routes/Restaurant/Marketing_Promotions_EmailCampaign.routes');
const MarketingSmsCampaignRoutes = require('./routes/Restaurant/Marketing_Promotions_SMSCampaign.routes');
const MarketingRewardRoutes = require('./routes/Restaurant/Marketing_Promotions_Reward.routes');
const SEOManagementRoutes = require('./routes/Restaurant/SEO_Management.routes');
const RestaurantItemCategoryRoutes = require('./routes/Restaurant/Restaurant_item_Category.routes');
const RestaurantItemsRoutes = require('./routes/Restaurant/Restaurant_Items.routes');
const SupplierItemsRoutes = require('./routes/Restaurant/Supplier_Items.routes');
const RestaurantAlertsTypeRoutes = require('./routes/Restaurant/Restaurant_Alerts_type.routes');
const RestaurantAlertsRoutes = require('./routes/Restaurant/Restaurant_Alerts.routes');
const RestaurantItemsReviewsTypeRoutes = require('./routes/Restaurant/Restaurant_Items_ReviewsType.routes');
const RestaurantItemsReviewsRoutes = require('./routes/Restaurant/Restaurant_Items_Reviews.routes');
const RestaurantItemsReviewsFormContentCreatorRoutes = require('./routes/Restaurant/Restaurant_Items_ReviewsForm_ContentCreator.routes');
const RestaurantItemsReviewsDashboardRoutes = require('./routes/Restaurant/Restaurant_Items_Reviews_Dashboard.routes');
const RestaurantWebsiteTemplateRoutes = require('./routes/Restaurant/Restaurant_website_Template.routes');
const RestaurantWebsiteOurDomainRoutes = require('./routes/Restaurant/Restaurant_website_OurDomain.routes');
const RestaurantWebsiteOwnDomainRoutes = require('./routes/Restaurant/Restaurant_website_OwnDomain.routes');
const RestaurantWebsiteIntegrateRoutes = require('./routes/Restaurant/Restaurant_website_Integrate.routes');
const RestaurantWebsiteSettingsRoutes = require('./routes/Restaurant/Restaurant_website_Settings.routes');
const RestaurantWebsiteDashboardRoutes = require('./routes/Restaurant/Restaurant_website_Dashboard.routes');
const RestaurantMobileAppRoutes = require('./routes/Restaurant/Restaurant_Mobile_app.routes');
const RestaurantMobileReportsFilterRoutes = require('./routes/Restaurant/Restaurant_Mobile_Reports_filter.routes');
const AnalyticsOperationsReportsRoutes = require('./routes/Restaurant/Analytics/Analytics_operations_Reports.routes');
const AnalyticsSocialMediaReportsRoutes = require('./routes/Restaurant/Analytics/Analytics_social_media_Reports.routes');
const RestaurantPlanRoutes = require('./routes/Restaurant/Restaurant_Plan.routes');
const RestaurantPlanSubscriptionRoutes = require('./routes/Restaurant/Restaurant_Plan_Subscripiton.routes');
const AdminPlanRoutes = require('./routes/Admin/Admin_Plan.routes');
const AdminPlanSubscriptionRoutes = require('./routes/Admin/Admin_Plan_Subscripiton.routes');
const HelpSupportContactRoutes = require('./routes/Restaurant/Help_Support_Contact.routes');
const IssueTypeRoutes = require('./routes/Master/Issue_Type.routes');
const HelpSupportReportAnIssueRoutes = require('./routes/Restaurant/Help_Support_ReportAnIssue.routes');
const HelpSupportFaqRoutes = require('./routes/Restaurant/Help_Support_Faq.routes');
const HelpSupportRateusRoutes = require('./routes/Restaurant/Help_Support_Rateus.routes');
const HelpSupportAboutAppRoutes = require('./routes/Restaurant/Help_Support_AboutApp.routes');
const VendorStoreRoutes = require('./routes/ShopingVendor/Vendor_Store.routes');
const VendorBankRoutes = require('./routes/ShopingVendor/Vendor_Bank.routes');
const VendorProductCategoryRoutes = require('./routes/ShopingVendor/Vendor_Product_Category.routes');
const VendorProductSubCategoryRoutes = require('./routes/ShopingVendor/Vendor_Product_SubCategory.routes');
const VendorExpensesRoutes = require('./routes/ShopingVendor/Vendor_Expenses.routes');
const VendorManagerRoutes = require('./routes/ShopingVendor/Vendor_Manager.routes');
const VendorDiscountCouponRoutes = require('./routes/ShopingVendor/Vendor_Discount_Coupon.routes');
const VendorProductsRoutes = require('./routes/ShopingVendor/Vendor_Products.routes');
// SocketChat routes - includes both REST API and Socket.io WebSocket
const SocketChatRoutes = require('./routes/Chat/SocketChat.routes');
const ChatFileUploadRoutes = require('./routes/Chat/ChatFileUpload.routes');
const ChatOTPRoutes = require('./routes/Chat/ChatOTP.routes');
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
router.use('/DasboardList', DasboardListRoutes);
router.use('/myFavorites', MyFavoritesRoutes);
router.use('/Order_Food/MyFavorites', OrderFoodMyFavoritesRoutes);
router.use('/Order_Food', OrderFoodRoutes);
router.use('/Cart', CartRoutes);
router.use('/User_Address', UserAddressRoutes);
router.use('/Order_Now', OrderNowRoutes);
router.use('/Referral', ReferralRoutes);
router.use('/Order_History', OrderHistoryRoutes);
router.use('/Delivery', DeliveryRoutes);
router.use('/Profile_setting', ProfileSettingRoutes);
router.use('/Catering_EventType', CateringEventTypeRoutes);
router.use('/Catering_Event', CateringEventRoutes);
router.use('/Food_Truck_Catering', FoodTruckCateringRoutes);
router.use('/Food_Truck_Vending', FoodTruckVendingRoutes);
router.use('/Schedule_Meeting', ScheduleMeetingRoutes);
router.use('/Catering_Type', CateringTypeRoutes);
router.use('/Catering', CateringRoutes);
router.use('/Grocery_Categories', GroceryCategoriesRoutes);
router.use('/Grocery_Categories_type', GroceryCategoriesTypeRoutes);
router.use('/Grocery_Items', GroceryItemsRoutes);
router.use('/Reel', ReelRoutes);
router.use('/Reel_View', Reel_ViewRoutes);
router.use('/Reel_Follow', Reel_FollowRoutes);
router.use('/Reel_Like', Reel_LikeRoutes);
router.use('/Reel_share', Reel_shareRoutes);
router.use('/Reel_Comment', Reel_CommentRoutes);
router.use('/Reel_Reports', Reel_ReportsRoutes);
router.use('/Reel_Dislikes', Reel_DislikesRoutes);
router.use('/Reel_Add_User', Reel_Add_UserRoutes);
router.use('/Room_Categories', Room_CategoriesRoutes);
router.use('/Rooms', RoomsRoutes);
router.use('/Room_Join', Room_JoinRoutes);
router.use('/ProfilePage', ProfilePageRoutes);
router.use('/Influencer', InfluencerRoutes);
router.use('/Effects_Categorys', EffectsCategorysRoutes);
router.use('/Effects', EffectsRoutes);
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
router.use('/Item_type', ItemTypeRoutes);
router.use('/GiftCards_type', GiftCardsTypeRoutes);
router.use('/GiftCards', GiftCardsRoutes);
router.use('/Item_Category', ItemCategoryRoutes);
router.use('/Rewards_type', RewardsTypeRoutes);
router.use('/Rewards', RewardsRoutes);
router.use('/Plan', PlanRoutes);
router.use('/payment_method', PaymentMethodRoutes);
router.use('/transaction', TransactionRoutes);
router.use('/subscription', SubscriptionRoutes);
router.use('/businessType', BusinessTypeRoutes);
router.use('/Business_Details', BusinessDetailsRoutes);
router.use('/business_Branch', BusinessBranchRoutes);
router.use('/CampaignType', CampaignTypeRoutes);
router.use('/closing_days', ClosingDaysRoutes);
router.use('/ContactSupport', ContactSupportRoutes);
router.use('/ReportAnIssue', ReportAnIssueRoutes);
router.use('/Customer', CustomerRoutes);
router.use('/GiftCards_Map', GiftCardsMapRoutes);
router.use('/Rewards_Map', RewardsMapRoutes);
router.use('/Discounts_type', DiscountsTypeRoutes);
router.use('/Discounts', DiscountsRoutes);
router.use('/Discounts_Map_User', DiscountsMapUserRoutes);
router.use('/ServiceCharges_type', ServiceChargesTypeRoutes);
router.use('/Service_Restaurant', ServiceRestaurantRoutes);
router.use('/ServiceCharges', ServiceChargesRoutes);
router.use('/Favourites', FavouritesRoutes);
router.use('/Working_Hours', WorkingHoursRoutes);
router.use('/Departments', DepartmentsRoutes);
router.use('/WorkForceManagement_Employee', WorkForceEmployeeRoutes);
router.use('/WorkForceManagement_Schedule_Onlyme', ScheduleOnlyMeRoutes);
router.use('/WorkForceManagement_Schedule_EveryOne', ScheduleEveryOneRoutes);
router.use('/WorkForceManagement_Schedule_Myavailability', ScheduleMyAvailabilityRoutes);
router.use('/Expenses', ExpensesRoutes);
router.use('/Branch_map_Bank', BranchMapBankRoutes);
router.use('/Finance', FinanceRoutes);
router.use('/Marketing_Promotions_coupon_Category', MarketingCouponCategoryRoutes);
router.use('/Marketing_Promotions_coupon', MarketingCouponRoutes);
router.use('/Marketing_Promotions_EmailCampaign', MarketingEmailCampaignRoutes);
router.use('/Marketing_Promotions_SMSCampaign', MarketingSmsCampaignRoutes);
router.use('/Marketing_Promotions_Reward', MarketingRewardRoutes);
router.use('/CampaignAllneedaPost', CampaignAllneedaPostRoutes);
router.use('/SocialMedia_Post', SocialMediaPostRoutes);
router.use('/SocialMedia_Live', SocialMediaLiveRoutes);
router.use('/SEO_Management', SEOManagementRoutes);
router.use('/Restaurant_item_Category', RestaurantItemCategoryRoutes);
router.use('/Restaurant_Items', RestaurantItemsRoutes);
router.use('/Supplier_Items', SupplierItemsRoutes);
router.use('/Restaurant_Alerts_type', RestaurantAlertsTypeRoutes);
router.use('/Restaurant_Alerts', RestaurantAlertsRoutes);
router.use('/Restaurant_Items_ReviewsType', RestaurantItemsReviewsTypeRoutes);
router.use('/Restaurant_Items_Reviews', RestaurantItemsReviewsRoutes);
router.use('/Restaurant_Items_ReviewsForm_ContentCreator', RestaurantItemsReviewsFormContentCreatorRoutes);
router.use('/Restaurant_Items_Reviews_Dashboard', RestaurantItemsReviewsDashboardRoutes);
router.use('/Restaurant_website_Template', RestaurantWebsiteTemplateRoutes);
router.use('/Restaurant_website_OurDomain', RestaurantWebsiteOurDomainRoutes);
router.use('/Restaurant_website_OwnDomain', RestaurantWebsiteOwnDomainRoutes);
router.use('/Restaurant_website_Integrate', RestaurantWebsiteIntegrateRoutes);
router.use('/Restaurant_website_Settings', RestaurantWebsiteSettingsRoutes);
router.use('/Restaurant_website_Dashboard', RestaurantWebsiteDashboardRoutes);
router.use('/Restaurant_Mobile_app', RestaurantMobileAppRoutes);
router.use('/Restaurant_Mobile_Reports_filter', RestaurantMobileReportsFilterRoutes);
router.use('/Analytics_operations_Reports', AnalyticsOperationsReportsRoutes);
router.use('/Analytics_social_media_Reports', AnalyticsSocialMediaReportsRoutes);
router.use('/Restaurant_Plan', RestaurantPlanRoutes);
router.use('/Restaurant_Plan_Subscripiton', RestaurantPlanSubscriptionRoutes);
router.use('/Admin_Plan', AdminPlanRoutes);
router.use('/Admin_Plan_Subscripiton', AdminPlanSubscriptionRoutes);
router.use('/Help_Support_Contact', HelpSupportContactRoutes);
router.use('/Issue_Type', IssueTypeRoutes);
router.use('/Help_Support_ReportAnIssue', HelpSupportReportAnIssueRoutes);
router.use('/Help_Support_Faq', HelpSupportFaqRoutes);
router.use('/Help_Support_Rateus', HelpSupportRateusRoutes);
router.use('/Help_Support_AboutApp', HelpSupportAboutAppRoutes);
router.use('/Vendor_Store', VendorStoreRoutes);
router.use('/Vendor_Bank', VendorBankRoutes);
router.use('/Vendor_Product_Category', VendorProductCategoryRoutes);
router.use('/Vendor_Product_SubCategory', VendorProductSubCategoryRoutes);
router.use('/Vendor_Expenses', VendorExpensesRoutes);
router.use('/Vendor_Manager', VendorManagerRoutes);
router.use('/Vendor_Discount_Coupon', VendorDiscountCouponRoutes);
router.use('/Vendor_Products', VendorProductsRoutes);
// SocketChat routes - REST API endpoints
router.use('/SocketChat', SocketChatRoutes);
// Chat file upload routes - REST API endpoints for file uploads
router.use('/chat', ChatFileUploadRoutes);
// Chat OTP routes - REST API endpoints for OTP sending
router.use('/chat', ChatOTPRoutes);
module.exports = router;
