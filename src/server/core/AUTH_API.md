# Authentication API Documentation

## Overview
This API provides JWT-based authentication for the food tracking application. It includes user registration, login, profile management, and token refresh functionality.

## Base URL
All authentication endpoints are prefixed with `/api/auth`

## Endpoints

### 1. Register User
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "confirmPassword": "securepassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "created_at": "2025-09-29T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Validation failed (invalid email, weak password, passwords don't match)
- `409` - User already exists
- `500` - Internal server error

---

### 2. Login User
**POST** `/api/auth/login`

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "created_at": "2025-09-29T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Validation failed (invalid email format, missing password)
- `401` - Authentication failed (invalid credentials)
- `500` - Internal server error

---

### 3. Get User Profile
**GET** `/api/auth/profile`

Get the current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "created_at": "2025-09-29T10:30:00.000Z",
      "profile": {
        "height_cm": 170.5,
        "weight_kg": 65.0,
        "sex": "female",
        "activity_level": "moderate",
        "goal": "maintain",
        "bmi": 22.5,
        "bmr": 1350.0,
        "tdee": 1890.0,
        "updated_at": "2025-09-29T10:30:00.000Z"
      }
    }
  }
}
```

**Error Responses:**
- `401` - Authentication required (no token or invalid token)
- `404` - User not found
- `500` - Internal server error

---

### 4. Refresh Token
**POST** `/api/auth/refresh`

Get a new JWT token using the current valid token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401` - Authentication required (no token or invalid token)
- `500` - Internal server error

---

### 5. Logout
**POST** `/api/auth/logout`

Logout the current user (client-side token removal).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Note:** Since JWT tokens are stateless, logout is primarily handled on the client side by removing the token from storage.

---

## Authentication Flow

### 1. Registration/Login
1. User registers with `/api/auth/register` or logs in with `/api/auth/login`
2. Server returns a JWT token valid for 7 days
3. Client stores the token (localStorage, sessionStorage, etc.)

### 2. Authenticated Requests
1. Include the token in the `Authorization` header: `Bearer <token>`
2. Server validates the token on each request
3. If token is valid, user information is available in `req.user`

### 3. Token Expiry
1. When token expires, server returns `401` with "Token expired" message
2. Client should redirect to login or try to refresh the token
3. Use `/api/auth/refresh` to get a new token if still within the refresh window

---

## Middleware

### `authenticateToken`
Protects routes that require authentication. Validates JWT token and adds user info to request.

**Usage:**
```typescript
router.get("/protected", authenticateToken, myController.protectedMethod);
```

### `optionalAuth`
Allows routes to work with or without authentication. If token is present and valid, adds user info to request.

**Usage:**
```typescript
router.get("/public", optionalAuth, myController.publicMethod);
```

### `requireAdmin`
Additional authorization check for admin-only routes (placeholder for future implementation).

---

## Security Features

- **Password Hashing:** Uses bcryptjs with 12 salt rounds
- **JWT Tokens:** Signed with HS256 algorithm, expire in 7 days
- **Input Validation:** Uses Zod for request validation
- **Error Handling:** Sanitized error messages in production
- **Database Verification:** Validates user existence on each request

---

## Environment Variables

```env
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"  # Optional, defaults to 7d
DATABASE_URL="your-database-connection-string"
```

---

## Integration with Food API

The food logging endpoint `/api/food/log` now requires authentication:

**Before:** Required `userId` in request body
```json
{
  "userId": 123,
  "selectedFood": {...},
  "portionGrams": 150
}
```

**After:** Uses authenticated user automatically
```json
{
  "selectedFood": {...},
  "portionGrams": 150
}
```

The user ID is automatically extracted from the JWT token, making the API more secure and user-friendly.