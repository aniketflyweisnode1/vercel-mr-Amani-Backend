# Allneeda Implementation – Backend Readiness Report

This report maps the questions raised in `Allneeda Implementation Afghanistan team concern and questions.pdf` to the current state of the backend found in this repository (`vercel-mr-Amani-Backend`). It highlights what is already implemented, identifies configuration details, and calls out notable gaps that may require follow-up work.

---

## 1. Authentication & Authorization

### 1.1 OTP-Based Login
The authentication flow is documented in `AMANi_API_README.md` (`🔐 Authentication` section) and implemented in `src/routes/Authentication/Login.routes.js`. Key OTA endpoints are:

- `POST /api/v2/authentication/userLogin` – request OTP
- `POST /api/v2/authentication/resendOtp` – resend OTP
- `POST /api/v2/authentication/verify_otp` – verify OTP and issue tokens
- `POST /api/v2/authentication/logout` – revoke session
- Vendor/Admin/Restaurant login endpoints (`/loginVendor`, `/loginAdmin`, `/loginRestaurant`) reuse the same controller with role-specific validation

### 1.2 JWT Payload Contents
JWT helpers live in `utils/jwt.js`. Generated payloads are:

- **Access Token (`generateAccessToken`)**
  ```json
  {
    "id": "<MongoDB _id>",
    "user_id": "<numeric auto-increment id>",
    "email": "<user.email>",
    "name": "<user.name>",
    "type": "access"
  }
  ```
- **Refresh Token (`generateRefreshToken`)**
  ```json
  {
    "id": "<MongoDB _id>",
    "user_id": "<numeric auto-increment id>",
    "type": "refresh"
  }
  ```

> **Gap:** Tokens currently do **not** include explicit role information (`role_id` or human-readable role names). If downstream services need role-based authorization from the token alone, an enhancement is required (e.g., add `role_id` and `roles` array to payload before signing).

### 1.3 Token Security

- **Secret**: Hard-coded string `'newuserToken'`. Recommend moving to `process.env.JWT_SECRET` loaded via `dotenv` to match best practices.
- **Expiry**: Access token `7d`, refresh token `30d` (configurable inside `utils/jwt.js`).
- **Storage**: Tokens are returned via JSON in the response body by authentication controllers. There is no built-in cookie support yet.
- **Encryption**: JWTs are signed (not encrypted). Payload can be read by clients; only signature integrity is guaranteed.

### 1.4 Role Enforcement

- User documents (`src/models/User.model.js`) store `role_id` and boolean `Islogin_permissions`.
- Controller helper `ensureRoleMatch` (`src/utils/role.js`) queries the `Role` collection to validate a user’s active role.
- Middleware `middleware/auth.js` verifies JWTs before protected routes and attaches `req.user`, `req.userId`, `req.userIdNumber`.

> **Gap:** Role-based authorization middleware (`authorize(...)`) is present but still compares against `req.user.role`, which is not populated by default. The data model uses `role_id`, so this logic needs alignment (e.g., load role document on auth and expose `req.userRoleName`). Also consider including roles in the JWT payload to satisfy the “token must have user roles” requirement from the PDF.

---

## 2. Validation, Request Handling & Security

### 2.1 Data Validation

- Validation is centralized in `middleware/validation.js` using **Joi** (`dependencies.joi` in `package.json`).
- Individual schemas are defined under `validators/`. Each route wires `validateBody(schema)` (see `Login.routes.js`, `User` routes, etc.).

### 2.2 Request Handling and Middleware Stack

The Express app (`server.js`) is configured with:

- `helmet` – secure HTTP headers (`helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })`).
- `cors` – currently open to `origin: "*"` with credentials allowed.
- `compression` – gzip compression for responses.
- `express.json` / `express.urlencoded` – body parsers with 10 MB limit.
- `express-rate-limit` – base rate limiting for `/api/` scope (100 requests / 15 minutes).
- `morgan` – HTTP request logging (`dev` output in all environments after recent simplification).
- Custom request logging was previously done via `utils/logger`, but the project now relies on native `console` methods.

### 2.3 API Security

- **Authentication middleware** (`middleware/auth.js`) validates access tokens on protected routes and ensures users are active with login permissions.
- **Error handling** (`middleware/errorHandler.js`) catches errors, logs via `console.error`, and normalizes response messages.
- No microservices messaging or service-to-service authentication is currently implemented. All APIs are monolithic HTTP endpoints.

> **Gap:** For “microservices communication” mentioned in the PDF, no message queues or service meshes exist in this codebase. Integrations (e.g., Kafka, RabbitMQ, gRPC) would need to be designed separately.

---

## 3. Domain Modules Overview

The repository already exposes CRUD-style controllers and routes for many domain entities referenced in the PDF (Category, SubCategory, Services, Country/State/City, Roles, Notifications, etc.). Each follows the same pattern:

- Model in `src/models/<name>.model.js`
- Controller in `src/controllers/<name>.controller.js`
- Validation schema in `validators/<name>.validator.js`
- Route definition in `src/routes/<domain>/<name>.js`

Each controller uses `sendSuccess` and `sendError` helpers from `utils/response.js` to standardize API replies.

---

## 4. Admin Workflow & Role Approval

- Admin-specific login endpoint is defined but the broader approval workflow described in the PDF (e.g., “buyers apply for seller role, admin approves”) is not fully realized in code yet.
- `User` model fields such as `Islogin_permissions` and `status` hint at a manual approval process, but there is no dedicated queue or status update route for role change requests.
- The README comment added by the client (`role_id` mapping and `Islogin_permissions` behavior) should be translated into explicit documentation and endpoints (e.g., POST `/role/request`, PATCH `/role/approve`).
- Notifications controllers/routes exist, but they do not yet enforce the specific templates mentioned in the PDF (order notifications, identity approval, etc.). Additional business logic may be required.

---

## 5. Real-Time Messaging & Offers

The PDF calls for:

- Real-time chat between buyers and professionals
- Custom offers with acceptance/rejection flows

The current backend does **not** include websocket infrastructure or dedicated `Offer`/`Chat` models. Implementation of real-time messaging (e.g., Socket.IO, WebSocket, or third-party messaging) remains pending. Existing controllers focus on CRUD operations for static resources.

---

## 6. Mobile Integrations

- No mobile push notification service integrations are present (e.g., FCM, APNs).
- If the mobile app expects push notifications for messages/alerts/discounts, an additional notification service layer is needed.

---

## 7. Recommendations & Next Steps

1. **JWT Payload Enhancement** – include `role_id`, role names, and permission flags before signing tokens to satisfy downstream authorization needs.
2. **Configurable Secrets** – load JWT secret and token expirations from environment variables.
3. **Role Authorization Middleware** – align `authorize(...)` middleware with the data model; consider injecting roles in `req.user` or `req.userRoles` during auth.
4. **Admin Workflow APIs** – design explicit endpoints for role change requests, approvals, and notifications to mirror the process described in the PDF.
5. **Real-Time Services** – plan architecture for chat and real-time offers (likely separate microservice or websocket gateway). Document expected payloads and protocols.
6. **Microservices/Messaging** – clarify whether the platform will remain monolithic or require inter-service messaging, then choose appropriate tooling (e.g., Redis, RabbitMQ, Kafka).
7. **Documentation Alignment** – update `AMANi_API_README.md` (or create a formal API spec) to cover the new admin/vendor endpoints and any additional workflows you implement.

---

### Appendix: Key Reference Files

- `server.js` – Express app bootstrap, middleware stack
- `middleware/auth.js` – JWT verification and request enrichment
- `middleware/validation.js` – Joi validation wrapper
- `utils/jwt.js` – Token generation and verification helpers
- `src/routes/Authentication/Login.routes.js` – Authentication endpoints
- `src/controllers/*` – Domain controllers
- `validators/*` – Joi schemas
- `utils/response.js` – Standardized API responses
- `utils/role.js` – Role validation helper

This document should serve as a foundation for the Afghan implementation team to evaluate current readiness and coordinate remaining development tasks. Let me know if you’d like the report exported to PDF after any additional edits.

