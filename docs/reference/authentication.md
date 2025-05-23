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

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com", 
  "password": "securepassword"
}
```

Response:
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

### Verify Email

```http
POST /auth/verify
Content-Type: application/json

{
  "token": "verification-token"
}
```

### Forgot Password

```http
POST /auth/forgot
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password

```http
POST /auth/reset
Content-Type: application/json

{
  "token": "reset-token",
  "password": "newpassword"
}
```

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

## Testing Authentication

Test your authentication endpoints:

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use the token in protected requests
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/protected-endpoint
``` 