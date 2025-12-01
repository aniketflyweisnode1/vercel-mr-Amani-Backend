# Postman Collection Guide

## Collection Variables

The collection uses the following variables:
- `{{amani}}` - Base URL (default: `http://localhost:3030`)
- `{{auth}}` - Bearer token for authentication

## Request Body Files

All request body examples are stored in the `request_bodies/` folder:

### Authentication
- No request body files needed (phoneNo and OTP are simple)

### User
- `User_Create.json` - For creating a new user
- `Change_Password.json` - For changing password

### Order Now
- `Order_Now_Create.json` - For creating an order from cart
- `Order_Now_ProcessPayment.json` - For processing payment

### Cart Order Food
- `Cart_Order_Food_Create.json` - For creating/adding items to cart

### Referral
- `Referral_Create.json` - For creating a referral

### Profile Setting
- `Profile_Setting_Create.json` - For creating profile settings
- `Profile_Setting_Update.json` - For updating profile settings

## How to Use Request Body Files

1. **Copy JSON Content**: Open the JSON file from `request_bodies/` folder
2. **Paste in Postman**: Copy the content and paste it into the request body in Postman
3. **Modify as Needed**: Update the values according to your test data

## Setting Up Authentication

1. **Login**: Use "User Login" endpoint with `phoneNo`
2. **Verify OTP**: Use "Verify OTP" endpoint with `phoneNo` and `otp`
3. **Get Token**: Copy the `accessToken` from the response
4. **Set Variable**: 
   - Click on collection name → Variables tab
   - Set `auth` = `your_access_token_here` (without "Bearer " prefix)
   - Or set it in Environment variables

## API Endpoints Summary

### Base URL
All endpoints use: `{{amani}}/api/v2/...`

### Authentication Required
Endpoints marked with 🔒 require Bearer token in Authorization header:
- Format: `Bearer {{auth}}`
- Set `{{auth}}` variable with your access token

### Endpoints

#### Authentication
- `POST /authentication/userLogin` - Login (send OTP)
- `POST /authentication/verify_otp` - Verify OTP (get token)
- `POST /authentication/resendOtp` - Resend OTP
- `POST /authentication/logout` 🔒 - Logout

#### User
- `POST /user/create` - Create user
- `PUT /user/changePassword` 🔒 - Change password
- `GET /user/getAll` - Get all users
- `GET /user/getById/:id` 🔒 - Get user by ID

#### Order Now
- `POST /Order_Now/create` 🔒 - Create order from cart
- `POST /Order_Now/processPayment` 🔒 - Process payment
- `GET /Order_Now/getAll` - Get all orders
- `GET /Order_Now/getById/:id` 🔒 - Get order by ID
- `GET /Order_Now/getByAuth` 🔒 - Get orders by authenticated user

#### Order History
- `GET /Order_History/Ongoing` 🔒 - Get ongoing orders
- `GET /Order_History/Completed` 🔒 - Get completed orders

#### Cart Order Food
- `POST /Cart_Order_Food/create` 🔒 - Create cart
- `GET /Cart_Order_Food/getByAuth` 🔒 - Get cart by authenticated user

#### Referral
- `POST /Referral/create` 🔒 - Create referral
- `GET /Referral/getByAuth` 🔒 - Get referrals by authenticated user

#### Profile Setting
- `POST /Profile_setting/create` 🔒 - Create profile setting
- `GET /Profile_setting/getByAuth` 🔒 - Get profile setting by authenticated user
- `PUT /Profile_setting/update/:id` 🔒 - Update profile setting

## Notes

- All request bodies in the collection match the JSON files in `request_bodies/` folder
- Update the `{{amani}}` variable if your server runs on a different port
- Update the `{{auth}}` variable after successful login/OTP verification
- Request bodies can be modified directly in Postman or by updating the JSON files

