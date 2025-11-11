# 🛠️ Amani API Documentation

**Base URL:**  
`https://vercel-mr-amani-backend.vercel.app`

All authenticated requests require a Bearer token in the header:
```bash
Authorization: Bearer <your_access_token>
```

---

## 🔐 Authentication

### 1. Send OTP  
**POST** `/api/v2/authentication/userLogin`
```json
{
  "phoneNo": "1234567890"
}
```

### 2. Verify OTP  
**POST** `/api/v2/authentication/verify_otp`
```json
{
  "phoneNo": "1234567890",
  "otp": "1234"
}
```
✅ Returns access token (`accessToken`) for authorization.

### 3. Login Vendor  
**POST** `/api/v2/authentication/loginVendor`
```json
{
  "email": "vendor@example.com",
  "phoneNo": "1234567890"
}
```

### 4. Login Admin  
**POST** `/api/v2/authentication/loginAdmin`
```json
{
  "phoneNo": "1234567890"
}
```

### 5. Login Restaurant  
**POST** `/api/v2/authentication/loginRestaurant`
```json
{
  "phoneNo": "1234567890"
}
```

### 6. Resend OTP  
**POST** `/authentication/resendOtp`
```json
{
  "phoneNo": "9876543210",
  "role": "User"
}
```

---

## 👤 User

### Create User  
**POST** `/api/v2/user/create`
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNo": "9876543210",
  "dob": "1990-01-01",
  "isAgreeTermsConditions": true,
  "role_id": 2, // 1 admin, 2 user, 3 vendor, 4 Restaurant 
  "Islogin_permissions" : true, // defult True, if false then get admin  approval workflow  (Registered  but not login)
  "status": true
}
```

### Get All Users  
**GET** `/api/v2/user/getAll?page=1&limit=10&status=true`

### Update User  
**PUT** `/api/v2/user/update/:id`
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phoneNo": "9876543210",
  "dob": "1990-01-01",
  "Islogin_permissions": true,
  "role_id": 1,
  "status": true
}
```

### Delete User  
**DELETE** `/api/v2/user/delete/:id`

---

## ⚙️ Role

- **POST** `/api/v2/role/create`
- **GET** `/api/v2/role/getAll`
- **GET** `/api/v2/role/getById/:id`
- **PUT** `/api/v2/role/update/:id`
- **DELETE** `/api/v2/role/delete/:id`

```json
{
  "name": "Admin",
  "status": true
}
```

---

## 🧾 Services

- **POST** `/api/v2/services/create`
- **GET** `/api/v2/services/getAll`
- **GET** `/api/v2/services/getById/:id`
- **PUT** `/api/v2/services/update/:id`
- **DELETE** `/api/v2/services/delete/:id`

```json
{
  "name": "Food Delivery",
  "description": "Food delivery service",
  "emozji": "🍔",
  "status": true
}
```

---

## 🍔 Category

- **POST** `/api/v2/category/create`
- **GET** `/api/v2/category/getAll`
- **GET** `/api/v2/category/getById/:id`
- **PUT** `/api/v2/category/update/:id`
- **DELETE** `/api/v2/category/delete/:id`

---

## 🍕 SubCategory

- **POST** `/api/v2/subcategory/create`
- **GET** `/api/v2/subcategory/getAll`
- **GET** `/api/v2/subcategory/getById/:id`
- **PUT** `/api/v2/subcategory/update/:id`
- **DELETE** `/api/v2/subcategory/delete/:id`
- **GET** `/api/v2/subcategory/getByCategoryId/:category_id`

---

## 🌍 Country / State / City

Each has full CRUD:

### Country  
`/api/v2/country/create`, `/getAll`, `/getById/:id`, `/update/:id`, `/delete/:id`

### State  
`/api/v2/state/create`, `/getAll`, `/getById/:id`, `/update/:id`, `/delete/:id`

### City  
`/api/v2/city/create`, `/getAll`, `/getById/:id`, `/update/:id`, `/delete/:id`

---

## 🗣️ Language

- **POST** `/api/Language/create`
- **GET** `/api/Language/getAll`
- **GET** `/api/Language/getById/:id`
- **PUT** `/api/Language/update/:id`
- **DELETE** `/api/Language/delete/:id`

---

## 🔔 Notification Type

- **POST** `/Notification_type/create`
- **GET** `/Notification_type/getAll`
- **GET** `/Notification_type/getById/:id`
- **PUT** `/Notification_type/update/:id`
- **DELETE** `/Notification_type/delete/:id`

---

## 📩 Notifications

- **POST** `/Notification/create`
- **GET** `/Notification/getAll`
- **GET** `/Notification/getById/:id`
- **PUT** `/Notification/update/:id`
- **DELETE** `/Notification/delete/:id`
- **GET** `/Notification/getByAuth`
