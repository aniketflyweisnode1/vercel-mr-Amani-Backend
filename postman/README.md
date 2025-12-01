# Postman Collection for Amani Backend API

## Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select `Amani_Backend.postman_collection.json`
4. Collection will be imported with all API endpoints

### 2. Import Environment
1. Click "Import" button
2. Select `Amani_Backend.postman_environment.json`
3. Environment will be imported with variables

### 3. Set Collection Variables
1. Click on the collection name "Amani Backend API"
2. Go to "Variables" tab
3. Set the following variables:
   - `amani` = `http://localhost:3030` (Base URL)
   - `auth` = `your_bearer_token_here` (Authentication token - get from login/verify OTP)

**OR** use Environment Variables:
1. Click on "Environments" in the left sidebar
2. Select "Amani Backend Environment" (or create new)
3. Set the following variables:
   - `amani` = `http://localhost:3030` (Base URL)
   - `auth` = `your_bearer_token_here` (Authentication token - get from login)

### 4. Using the Collection

#### Authentication Flow:
1. **User Login** - POST `/api/v2/authentication/userLogin`
   - Body: `{"phoneNo": "1234567890"}`
   - This will send OTP to the phone number

2. **Verify OTP** - POST `/api/v2/authentication/verify_otp`
   - Body: `{"phoneNo": "1234567890", "otp": "12345"}`
   - Response will contain `accessToken` and `refreshToken`
   - Copy the `accessToken` and set it in the `auth` environment variable

3. **Set Auth Token**:
   - After verifying OTP, copy the `accessToken` from response
   - Go to Collection Variables or Environment Variables
   - Set `auth` = `your_access_token_here` (without "Bearer " prefix)
   - All authenticated requests will now use this token automatically via `Bearer {{auth}}`

## API Endpoints

### Authentication
- `POST /api/v2/authentication/userLogin` - Login (send OTP)
- `POST /api/v2/authentication/verify_otp` - Verify OTP and get token
- `POST /api/v2/authentication/resendOtp` - Resend OTP
- `POST /api/v2/authentication/logout` - Logout (requires auth)

### User
- `POST /api/v2/user/create` - Create user
- `PUT /api/v2/user/changePassword` - Change password (requires auth)
- `GET /api/v2/user/getAll` - Get all users
- `GET /api/v2/user/getById/:id` - Get user by ID (requires auth)

### Order Now
- `POST /api/v2/Order_Now/create` - Create order from cart (requires auth)
- `POST /api/v2/Order_Now/processPayment` - Process payment for order (requires auth)
- `GET /api/v2/Order_Now/getAll` - Get all orders
- `GET /api/v2/Order_Now/getById/:id` - Get order by ID (requires auth)
- `GET /api/v2/Order_Now/getByAuth` - Get orders by authenticated user (requires auth)

### Order History
- `GET /api/v2/Order_History/Ongoing` - Get ongoing orders (requires auth)
- `GET /api/v2/Order_History/Completed` - Get completed orders (requires auth)

### Cart Order Food
- `POST /api/v2/Cart_Order_Food/create` - Create cart (requires auth)
- `GET /api/v2/Cart_Order_Food/getByAuth` - Get cart by authenticated user (requires auth)

### Referral
- `POST /api/v2/Referral/create` - Create referral (requires auth)
- `GET /api/v2/Referral/getByAuth` - Get referrals by authenticated user (requires auth)

### Profile Setting
- `POST /api/v2/Profile_setting/create` - Create profile setting (requires auth)
- `GET /api/v2/Profile_setting/getByAuth` - Get profile setting by authenticated user (requires auth)
- `PUT /api/v2/Profile_setting/update/:id` - Update profile setting (requires auth)

## Request Body Examples

All request body examples are available in the `request_bodies/` folder:
- `User_Create.json` - User creation
- `Change_Password.json` - Change password
- `Order_Now_Create.json` - Create order
- `Order_Now_ProcessPayment.json` - Process payment
- `Cart_Order_Food_Create.json` - Create cart
- `Referral_Create.json` - Create referral
- `Profile_Setting_Create.json` - Create profile setting
- `Profile_Setting_Update.json` - Update profile setting

## Notes

- All endpoints with "requires auth" need the Bearer token in the Authorization header
- The token is automatically added using the `{{auth_token}}` variable
- Base URL is set via `{{base_url}}` or `{{amani}}` variable
- Update the environment variables as needed for different environments (dev, staging, production)

