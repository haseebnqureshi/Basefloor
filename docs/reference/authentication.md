---
layout: default
title: Authentication Reference
---

# MinAPI Authentication Reference

MinAPI includes a built-in authentication system based on JSON Web Tokens (JWT) that provides secure user authentication, password management, and access control.

## Configuration

To enable authentication, add the following to your `minapi.config.js`:

```javascript
auth: {
  enabled: true,
  jwt: {
    expirations: {
      auth: '7d',  // Authentication token expiration
      verify: '24h',  // Verification token expiration
      reset: '1h'  // Password reset token expiration
    }
  }
}
```

## Authentication Routes

When authentication is enabled, MinAPI automatically adds these endpoints:

### Register

```http
POST /auth/register
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "created_at": "2024-05-10T12:00:00Z",
    "updated_at": "2024-05-10T12:00:00Z"
  },
  "token": "jwt_token_here"
}
```

### Login

```http
POST /auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "created_at": "2024-05-10T12:00:00Z",
    "updated_at": "2024-05-10T12:00:00Z"
  },
  "token": "jwt_token_here"
}
```

### Password Reset Request

```http
POST /auth/reset
```

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

### Password Reset Confirmation

```http
POST /auth/reset/:token
```

**Request:**
```json
{
  "password": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully."
}
```

### Email Verification

```http
GET /auth/verify/:token
```

**Response:**
```json
{
  "message": "Email has been verified successfully."
}
```

### Refresh Token

```http
POST /auth/refresh
```

**Headers:**
- `Authorization`: Bearer token

**Response:**
```json
{
  "token": "new_jwt_token_here"
}
```

## Programmatic Usage

MinAPI exposes an `Auth` object with methods for working with authentication:

### Hash a Password

```javascript
const hashedPassword = await API.Auth.hash('plainTextPassword');
```

### Check a Password

```javascript
const isMatch = await API.Auth.check('plainTextPassword', hashedPassword);
```

### Generate a Token

```javascript
const token = API.Auth.token({
  _id: 'user_id',
  type: 'auth',  // auth, verify, or reset
  sub: 'user@example.com'
});
```

### Verify a Token

```javascript
try {
  const decoded = API.Auth.verify(token);
  // Token is valid
  console.log(decoded);
} catch (error) {
  // Token is invalid
  console.error(error);
}
```

### Generate 2FA Secret

```javascript
const secret = API.Auth.twoFactor.generateSecret({
  name: 'My API',
  account: 'user@example.com'
});
```

### Verify 2FA Token

```javascript
const isValid = API.Auth.twoFactor.verify({
  token: '123456',  // Token from authenticator app
  secret: userSecret
});
```

## User Model

MinAPI's authentication system requires a `Users` model with specific fields:

```javascript
models: {
  Users: {
    collection: 'user',
    labels: ['User', 'Users'],
    values: {
      _id: ['ObjectId', 'rd'],
      email: ['String', 'cru'],
      password_hash: ['String', 'c'],
      email_verified: ['Boolean', 'cru', false],
      two_factor_enabled: ['Boolean', 'cru', false],
      two_factor_secret: ['String', 'cru'],
      reset_token: ['String', 'c'],
      reset_expires: ['Date', 'c'],
      created_at: ['Date', 'r'],
      updated_at: ['Date', 'r']
    }
  }
}
```

## Custom Authentication Logic

You can customize authentication behavior by extending the auth routes:

```javascript
// Add custom auth middleware for all routes
API.use((req, res, next) => {
  // Custom logic for authentication
  next();
});

// Add custom route handling
API.post('/auth/custom', async (req, res) => {
  // Custom authentication logic
});
```

## Integration with OAuth Providers

While MinAPI doesn't include built-in OAuth providers, you can easily integrate them:

```javascript
// Example Google OAuth integration
API.get('/auth/google', (req, res) => {
  // Redirect to Google OAuth
});

API.get('/auth/google/callback', async (req, res) => {
  // Handle OAuth callback
  const { token, profile } = await handleGoogleCallback(req);
  
  // Find or create user
  const user = await API.DB.Users.readOrCreate(
    { email: profile.email },
    {
      email: profile.email,
      email_verified: true,
      google_id: profile.id,
      name: profile.name
    }
  );
  
  // Generate JWT token
  const authToken = API.Auth.token({
    _id: user._id,
    type: 'auth',
    sub: user.email
  });
  
  res.json({ user, token: authToken });
});
```

## Using Authentication in Routes

All routes defined in your `routes` configuration can use the authenticated user:

```javascript
routes() {
  return {
    "/profile": {
      r: {
        allow: '@_user._id',  // Require authenticated user
        handler: async (req, res) => {
          // The authenticated user is available in req.user
          res.json(req.user);
        }
      }
    },
    "/admin-only": {
      r: {
        allow: 'admin=@_user.role',  // Require admin role
        handler: async (req, res) => {
          res.json({ message: "You are an admin" });
        }
      }
    }
  }
}
```

## Email Templates for Authentication

If you have the email module enabled, MinAPI can send authentication emails:

```javascript
// Set up email templates in minapi.config.js
emails: {
  enabled: true,
  provider: '@mailgun/emails',
  templates: {
    verification: 'verification-template-id',
    resetPassword: 'reset-password-template-id'
  }
}
```

## Security Best Practices

1. **Use HTTPS**: Always use HTTPS in production
2. **Token Expiration**: Use reasonable expiration times for tokens
3. **Password Policy**: Enforce strong password requirements
4. **Rate Limiting**: Implement rate limiting for auth endpoints
5. **Two-Factor Authentication**: Enable 2FA for sensitive operations
6. **Secure Headers**: Set secure headers like CORS, CSP, etc.
7. **Environment Variables**: Store JWT secret and other sensitive data in environment variables 