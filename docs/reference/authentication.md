# Authentication

Basefloor provides a comprehensive authentication system built around JWT tokens with support for user registration, login, email verification, and password reset functionality.

## Features

- JWT-based authentication
- User registration and login
- Email verification
- Password reset functionality
- Token refresh capabilities
- Role-based access control

## Configuration

Configure authentication in your `basefloor.config.js`:

```javascript
module.exports = (API) => {
  return {
    auth: {
      jwt: {
        secret: process.env.JWT_SECRET,
        expirations: {
          auth: '7d',      // Authentication token
          verify: '24h',   // Email verification token  
          reset: '1h'      // Password reset token
        }
      },
      registration: {
        enabled: true,
        requireEmailVerification: true,
        defaultRole: 'user'
      }
    }
  }
}
```

## User Model

Basefloor includes a built-in Users model with the following fields:

- `email` - User's email address (required, unique)
- `password_hash` - Hashed password
- `name` - User's display name
- `role` - User role for permissions
- `email_verified` - Email verification status
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

## Authentication Endpoints

### Register

Register a new user account:

<APIExplorer 
  method="POST" 
  endpoint="/auth/register" 
  :requiresAuth="false"
  sampleBody='{"email": "user@example.com", "password": "securePassword123", "name": "John Doe"}'
/>

**Static Example:**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

### Login

Authenticate a user and receive a JWT token:

<APIExplorer 
  method="POST" 
  endpoint="/auth/login" 
  :requiresAuth="false"
  sampleBody='{"email": "user@example.com", "password": "securePassword123"}'
/>

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Static Example:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com", 
  "password": "securepassword"
}
```

### Verify Email

Verify a user's email address with a verification token:

<APIExplorer 
  method="POST" 
  endpoint="/auth/verify" 
  :requiresAuth="false"
  sampleBody='{"token": "verification-token-here"}'
/>

**Static Example:**
```http
POST /auth/verify
Content-Type: application/json

{
  "token": "verification-token"
}
```

### Forgot Password

Request a password reset email:

<APIExplorer 
  method="POST" 
  endpoint="/auth/forgot" 
  :requiresAuth="false"
  sampleBody='{"email": "user@example.com"}'
/>

**Static Example:**
```http
POST /auth/forgot
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password

Reset password using a reset token:

<APIExplorer 
  method="POST" 
  endpoint="/auth/reset" 
  :requiresAuth="false"
  sampleBody='{"token": "reset-token-here", "password": "newSecurePassword123"}'
/>

**Static Example:**
```http
POST /auth/reset
Content-Type: application/json

{
  "token": "reset-token",
  "password": "newpassword"
}
```

### Get Current User

Get the authenticated user's information:

<APIExplorer 
  method="GET" 
  endpoint="/auth/user" 
  :requiresAuth="true"
/>

## Testing Authentication Flow

### Complete Authentication Workflow

1. **Register a new user** using the registration endpoint above
2. **Login with credentials** to get a JWT token
3. **Copy the token** from the login response
4. **Use the token** in the "Get Current User" endpoint to verify authentication
5. **Test protected endpoints** using the token

> **💡 Pro Tip**: After logging in, copy the JWT token from the response and paste it into the "Bearer Token" field of other authenticated endpoints to test them.

## Using Authentication in Routes

Protect your routes by adding authentication requirements:

```javascript
{
  routes: [
    {
      _id: '/protected-resource(Model)',
      _create: { 
        allow: true,  // Requires valid JWT token
        inject: { user_id: '@user._id' }  // Inject authenticated user ID
      },
      _read: { 
        allow: '@_user.user_id=@user._id'  // Only allow access to own resources
      }
    }
  ]
}
```

## Permission Checks

Use the authenticated user in permission rules:

- `@user._id` - Authenticated user's ID
- `@user.email` - Authenticated user's email
- `@user.role` - Authenticated user's role
- `@user.email_verified` - Email verification status

Example permission rules:

```javascript
{
  allow: '@user.role=admin',  // Only admins
  allow: '@user.email_verified=true',  // Only verified users
  allow: '@_user.owner_id=@user._id'  // Only resource owner
}
```

## Custom User Fields

Extend the Users model with custom fields:

```javascript
{
  models: {
    Users: {
      values: {
        // Default fields...
        department: ['String', 'cru'],
        phone: ['String', 'cru'],
        preferences: ['Object', 'cru', {}]
      }
    }
  }
}
```

## Security Best Practices

1. **Use strong JWT secrets**: Generate cryptographically secure secrets
2. **Enable email verification**: Prevent unauthorized account creation
3. **Set appropriate token expiration**: Balance security with user experience
4. **Use HTTPS**: Always serve authentication endpoints over HTTPS
5. **Validate input**: basefloor provides built-in validation for auth endpoints

## Error Handling

Authentication endpoints return standard HTTP status codes:

- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid credentials/token)
- `403` - Forbidden (account not verified, etc.)
- `404` - Not found (user doesn't exist)
- `500` - Server error

## Integration with Email

Configure email settings for verification and password reset:

```javascript
{
  email: {
    provider: 'postmark',
    from: 'noreply@yourdomain.com',
    templates: {
      emailVerification: 'template-id',
      passwordReset: 'template-id'
    }
  }
}
```

## Environment Configuration

### Development
```bash
API_BASE_URL=http://localhost:3000
JWT_SECRET=dev-secret-key
EMAIL_PROVIDER=console  # Logs emails to console
```

### Production
```bash
API_BASE_URL=https://api.yourdomain.com
JWT_SECRET=your-secure-production-secret
EMAIL_PROVIDER=postmark
POSTMARK_SERVER_TOKEN=your-postmark-token
```

## Testing Authentication

Test your authentication endpoints using the interactive tools above, or use these command-line examples:

```bash
# Set your API base URL
API_BASE_URL="https://api.yourdomain.com"  # Production
# API_BASE_URL="http://localhost:3000"     # Development

# Register a new user
curl -X POST ${API_BASE_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST ${API_BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use the token in protected requests
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  ${API_BASE_URL}/auth/user
```

## Next Steps

- **Test the endpoints** using the interactive tools above
- **Configure email services** for verification and password reset
- **Set up proper environment variables** for your deployment
- **Implement frontend authentication** using the [Code Playground](/tools/code-playground) examples
- **Explore the [API Explorer](/tools/api-explorer)** for more advanced testing 