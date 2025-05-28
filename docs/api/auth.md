# Authentication Service

The Authentication service provides comprehensive user authentication and authorization capabilities for your Basefloor application.

## Overview

The Auth module includes user registration, login, password management, email verification, and JWT token-based authentication. It provides secure authentication flows with built-in email integration and comprehensive route protection.

## Configuration

Enable authentication in your `basefloor.config.js`:

```javascript
module.exports = (API) => {
  return {
    auth: {
      enabled: true,
    },
    project: {
      app: {
        secret: process.env.APP_SECRET, // Required for JWT signing
        name: 'Your App Name',
        author: {
          name: 'Your Company',
          email: 'support@yourapp.com',
        },
        urls: {
          verify: 'https://yourapp.com/verify/:token', // Email verification URL
        },
      },
    },
    // Email service required for auth features
    emails: {
      enabled: true,
      provider: '@postmark/emails',
    },
    providers: {
      '@postmark/emails': {
        serverToken: process.env.POSTMARK_SERVER_TOKEN,
      },
    },
  }
}
```

## Authentication Routes

### User Registration

Register a new user account.

**Endpoint:** `POST /register`

**Request Body:**
```javascript
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
  // ... any additional user fields
}
```

**Response:**
```javascript
{
  "message": "user registered!"
}
```

**Example:**
```javascript
const response = await fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'mypassword123',
    first_name: 'John',
    last_name: 'Doe'
  })
});
```

### User Login

Authenticate a user and receive a JWT token.

**Endpoint:** `POST /login`

**Request Body:**
```javascript
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "logged in!"
}
```

**Example:**
```javascript
const response = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'mypassword123'
  })
});

const { token } = await response.json();
// Store token for subsequent requests
localStorage.setItem('authToken', token);
```

### Get User Information

Retrieve the authenticated user's information.

**Endpoint:** `GET /user`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```javascript
{
  "_id": "user_id",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "email_verified": true,
  // ... other user fields
}
```

**Example:**
```javascript
const response = await fetch('/api/user', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Update User Information

Update the authenticated user's profile.

**Endpoint:** `PUT /user`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```javascript
{
  "first_name": "Jane",
  "last_name": "Smith"
  // ... any updatable fields
}
```

**Response:**
```javascript
{
  "message": "updated user!"
}
```

### Delete User Account

Delete the authenticated user's account.

**Endpoint:** `DELETE /user`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```javascript
{
  "message": "deleted user!"
}
```

## Password Reset Flow

### Request Password Reset

Send a password reset code to the user's email.

**Endpoint:** `POST /user/reset/password`

**Request Body:**
```javascript
{
  "email": "user@example.com"
}
```

**Response:**
```javascript
{
  "token": "reset_token_here",
  "message": "emailed code!"
}
```

### Verify Reset Code

Verify the emailed reset code.

**Endpoint:** `GET /user/reset/password/:code`

**Headers:** `Authorization: Bearer <reset_token>`

**Response:**
```javascript
{
  "token": "verified_reset_token",
  "validated": true
}
```

### Complete Password Reset

Set a new password after verification.

**Endpoint:** `PUT /user/reset/password`

**Headers:** `Authorization: Bearer <verified_reset_token>`

**Request Body:**
```javascript
{
  "password": "newpassword123"
}
```

**Response:**
```javascript
{
  "token": "new_auth_token",
  "message": "password changed and logged in!"
}
```

## Email Verification

### Request Email Verification

Send an email verification link to the user.

**Endpoint:** `POST /user/verify/email`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```javascript
{
  "message": "sending verification!",
  "token": "verification_token"
}
```

### Check Verification Status

Check if the user's email is verified.

**Endpoint:** `GET /user/verify`

**Headers:** `Authorization: Bearer <verification_token>`

**Response:**
```javascript
{
  "status": true,
  "message": "user email is verified!"
}
```

### Complete Email Verification

Mark the user's email as verified (typically called from email link).

**Endpoint:** `PUT /user/verify`

**Headers:** `Authorization: Bearer <verification_token>`

**Response:**
```javascript
{
  "message": "user email verified!"
}
```

## Authentication Utilities

The auth module provides several utility functions accessible via `API.Auth`:

### Password Hashing

```javascript
// Hash a password
const hashedPassword = await API.Auth.hashPassword('plaintext_password');

// Compare password with hash
const isValid = await API.Auth.comparePasswordWithHashed('plaintext_password', hashedPassword);
```

### Cryptographic Functions

```javascript
// Generate MD5 hash
const md5Hash = API.Auth.md5('data_to_hash');

// Generate SHA1 hash
const sha1Hash = API.Auth.sha1('data_to_hash');

// Parse email parts
const parts = API.Auth.emailParts('user@example.com');
// Returns: { username: 'user', domain: 'example.com' }
```

### File Operations

```javascript
// Remove a file (async)
await API.Auth.removeFile('/path/to/file');
```

## Middleware

### Authentication Middleware

Protect routes with authentication middleware:

```javascript
// Require authentication
app.get('/protected-route', [
  API.requireAuthentication,
  API.postAuthentication,
], (req, res) => {
  // req.user contains the authenticated user
  res.json({ user: req.user });
});
```

### Custom Route Protection

```javascript
// Custom middleware example
app.get('/admin-only', [
  API.requireAuthentication,
  API.postAuthentication,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  }
], (req, res) => {
  res.json({ message: 'Admin area' });
});
```

## Email Templates

The auth module includes built-in email templates:

### Password Reset Email

```javascript
// Located at: auth/emails/resetPasswordWithCode.js
const emailArgs = require('./auth/emails/resetPasswordWithCode')(email, {
  code: '123456',
  durationText: '15 minutes',
  appName: 'Your App',
  appAuthor: 'Your Company',
  appAuthorEmail: 'support@yourapp.com',
});
```

### Email Verification

```javascript
// Located at: auth/emails/verifyEmail.js
const emailArgs = require('./auth/emails/verifyEmail')(email, {
  url: 'https://yourapp.com/verify?token=abc123',
  appName: 'Your App',
  appAuthor: 'Your Company',
});
```

### Password Changed Confirmation

```javascript
// Located at: auth/emails/changedPassword.js
const emailArgs = require('./auth/emails/changedPassword')(email, {
  appName: 'Your App',
  appAuthor: 'Your Company',
  appAuthorEmail: 'support@yourapp.com',
});
```

## Database Requirements

The auth module expects a `Users` model with the following fields:

```javascript
// Minimum required fields
{
  email: String, // Unique
  password_hash: String,
  email_verified: Boolean,
  // Optional fields
  first_name: String,
  last_name: String,
  sms: String,
  sms_verified: Boolean,
  // ... any additional user fields
}
```

## Security Features

### JWT Token Management

- Tokens are signed with your app secret
- Different token types for different purposes (auth, reset, verify)
- Automatic token expiration
- Secure token validation

### Password Security

- Passwords are hashed using bcrypt with salt rounds
- Plain text passwords are never stored
- Secure password comparison

### Rate Limiting

Consider implementing rate limiting for auth endpoints:

```javascript
// Example with express-rate-limit
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);
```

## Environment Variables

Required environment variables:

```bash
# Required
APP_SECRET=your_very_secure_secret_key_here

# Email service (required for auth features)
POSTMARK_SERVER_TOKEN=your_postmark_token

# Optional: Custom token expiration times
JWT_EXPIRATION=7d
RESET_TOKEN_EXPIRATION=15m
VERIFY_TOKEN_EXPIRATION=24h
```

## Error Handling

The auth module includes comprehensive error handling:

```javascript
// Common error responses
{
  "error": "user not found!",
  "code": 404
}

{
  "error": "incorrect login information!",
  "code": 401
}

{
  "error": "email@example.com is already registered!",
  "code": 400
}
```

## Testing Integration

The auth module includes built-in API checks for testing:

```javascript
// Automatically registered checks include:
// - User registration
// - User login
// - Get user information
// - Password reset flow
// - Email verification flow

// Run checks
await API.Checks.run();
```

## Best Practices

1. **Secure Secrets**: Use strong, unique secrets for JWT signing
2. **HTTPS Only**: Always use HTTPS in production for auth endpoints
3. **Token Storage**: Store tokens securely on the client side
4. **Password Requirements**: Implement strong password requirements
5. **Rate Limiting**: Implement rate limiting on auth endpoints
6. **Email Verification**: Require email verification for sensitive operations
7. **Session Management**: Implement proper session management and logout
8. **Audit Logging**: Log authentication events for security monitoring

## Frontend Integration

### React Example

```javascript
// Auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const login = async (email, password) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('authToken', data.token);
      // Fetch user data
      fetchUser();
    }
  };

  const fetchUser = async () => {
    if (!token) return;
    
    const response = await fetch('/api/user', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (response.ok) {
      const userData = await response.json();
      setUser(userData);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, token }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Troubleshooting

### Common Issues

1. **Invalid Token**: Check token format and expiration
2. **Email Not Sending**: Verify email service configuration
3. **Password Hash Errors**: Ensure bcrypt is properly installed
4. **Database Errors**: Verify Users model exists and has required fields
5. **CORS Issues**: Configure CORS for your frontend domain

### Debug Mode

Enable debug logging:

```javascript
// In your route handlers
API.Log('Auth debug info', { user: req.user, token: req.headers.authorization });
``` 