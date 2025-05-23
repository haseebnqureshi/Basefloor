---
layout: default
title: Configuration Guide
---

# MinAPI Configuration Guide

The heart of a MinAPI application is the `minapi.config.js` file, which defines the entire structure and behavior of your API. This guide explains all available configuration options.

## Configuration Structure

The `minapi.config.js` file exports a function that takes `API` as a parameter and returns a configuration object:

```javascript
module.exports = (API) => {
  return {
    project: { /* project configuration */ },
    middlewares: { /* middleware configuration */ },
    db: '@mongodb/db', // Database provider
    providers: { /* provider configuration */ },
    models: { /* data models */ },
    routes: () => ({ /* route definitions */ }),
    auth: { /* auth configuration */ },
    files: { /* file management configuration */ },
    emails: { /* email configuration */ },
    ai: { /* AI integration */ },
    transcription: { /* transcription service */ }
  };
};
```

## Project Configuration

The `project` section defines basic information about your API:

```javascript
project: {
  name: 'api.example.com',  // API name
  env: process.env.NODE_ENV || 'development',  // Environment
  port: process.env.PORT || 3000,  // Server port
  checks: false,  // Enable/disable check system
  app: {
    name: 'My Application',  // Application name
    secret: process.env.APP_SECRET,  // App secret (for JWT)
    author: {
      name: 'Your Name',
      email: 'your@email.com',
    },
    urls: {
      verify: process.env.APP_URLS_VERIFY,  // Email verification URL
    }
  }
}
```

## Middleware Configuration

Configure Express middleware:

```javascript
middlewares: {
  limit: process.env.REQUEST_SIZE_LIMIT || '10mb',  // Request size limit
  cors: true,  // Enable CORS
  extended: false,  // Use extended URL encoding
}
```

## Database Configuration

MinAPI uses MongoDB as its database:

```javascript
db: '@mongodb/db',  // Database provider name
providers: {
  '@mongodb/db': {
    host: process.env.MONGODB_HOST,
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    appName: process.env.MONGODB_APPNAME,
    database: process.env.MONGODB_DATABASE,
  }
}
```

## Models Configuration

Models define your database collections and their fields:

```javascript
models: {
  Users: {
    collection: 'user',  // Collection name
    labels: ['User', 'Users'],  // Human-readable labels
    filters: {  // Data filters
      where: w => ({ ...w }),
      update: body => ({ ...body }),
      values: row => ({ ...row }),
    },
    values: {  // Field definitions
      _id: ['ObjectId', 'rd'],  // Field type and CRUD permissions
      email: ['String', 'cru'],
      password_hash: ['String', 'c'],
      created_at: ['Date', 'r'],
      updated_at: ['Date', 'r'],
    }
  }
}
```

### Field Types

- `String`: Text values
- `Number`: Numeric values
- `Date`: Date and time values
- `Boolean`: True/false values
- `ObjectId`: MongoDB ObjectId (typically for IDs and references)
- `Array`: Lists of values

### CRUD Permission Flags

- `c`: Create - Field can be set when creating a new record
- `r`: Read - Field can be read
- `u`: Update - Field can be updated
- `d`: Delete - Field can be used in delete conditions

## Routes Configuration

Routes define your API endpoints:

```javascript
routes() {
  const where = '_id'
  const isAdmin = `admin=@_user.role`
  const isAuthor = `@_user._id=@{collection}.user_id`
  
  return {
    "/users(Users)": {  // Route with model
      c: { allow: true },  // Create permission
      rA: { allow: isAdmin },  // Read All permission
      r: { where, allow: true },  // Read permission
      u: { where, allow: { or: [isAdmin, isAuthor] } },  // Update permission
      d: { where, allow: isAdmin }  // Delete permission
    }
  }
}
```

### Route Path Syntax

- Basic path: `/path`
- With parameters: `/path/:param`
- With model: `/path(ModelName)`
- Nested routes: `/parent/:parentId/child/:childId`

### Permission Rules

- `allow: true` - Allow all
- `allow: false` - Deny all
- `allow: '@_user._id=@resource.user_id'` - Allow if user ID matches resource's user ID
- `allow: 'admin=in=@_user.roles'` - Allow if user has admin role
- `allow: { and: [rule1, rule2] }` - Logical AND of multiple rules
- `allow: { or: [rule1, rule2] }` - Logical OR of multiple rules

## Authentication Configuration

```javascript
auth: {
  enabled: true,
  jwt: {
    expirations: {
      auth: '7d',  // Auth token expiration
      verify: '24h',  // Verification token expiration
      reset: '1h'  // Password reset token expiration
    }
  }
}
```

## File Management Configuration

```javascript
files: {
  enabled: true,
  provider: '@digitalocean/files',  // File storage provider
}
```

### Supported File Storage Providers

- `@digitalocean/files` - DigitalOcean Spaces
- `@aws/files` - AWS S3
- `@local/files` - Local filesystem

## Email Configuration

```javascript
emails: {
  enabled: true,
  provider: '@mailgun/emails',  // Email provider
}
```

### Supported Email Providers

- `@mailgun/emails` - Mailgun
- `@postmark/emails` - Postmark

## AI Configuration

```javascript
ai: {
  enabled: true,
  providers: {
    "Anthropic": "@anthropic/ai",  // AI provider
  }
}
```

## Transcription Configuration

```javascript
transcription: {
  enabled: true,
  provider: '@google/transcription',  // Transcription provider
}
```

## Provider Configuration

All external service providers are configured in the `providers` section:

```javascript
providers: {
  '@anthropic/ai': {
    apiKey: process.env.ANTHROPIC_API_KEY,
    models: {
      default: 'claude-3-5-sonnet-20241022',
    },
  },
  '@digitalocean/files': {
    access: process.env.DIGITALOCEAN_SPACES_ACCESS,
    secret: process.env.DIGITALOCEAN_SPACES_SECRET,
    endpoint: process.env.DIGITALOCEAN_SPACES_ENDPOINT,
    region: process.env.DIGITALOCEAN_SPACES_REGION,
    bucket: process.env.DIGITALOCEAN_SPACES_BUCKET,
    cdn: process.env.DIGITALOCEAN_SPACES_CDN,
  },
  '@mailgun/emails': {
    username: process.env.MAILGUN_USERNAME,
    from: process.env.MAILGUN_FROM,
    token: process.env.MAILGUN_TOKEN,
    domain: process.env.MAILGUN_DOMAIN,
  },
  '@google/transcription': {
    keyFilename: '/path/to/your-google-credentials.json',
  }
}
```

## Environment Variables

For security and portability, it's recommended to use environment variables for all sensitive information and configuration that might change between environments.

Create a `.env` file in your project root with values like:

```
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_HOST=mongodb://localhost:27017
MONGODB_DATABASE=my_api_db
MONGODB_USERNAME=username
MONGODB_PASSWORD=password

# Authentication
JWT_SECRET=your-jwt-secret

# File Storage (DigitalOcean)
DIGITALOCEAN_SPACES_ACCESS=your-access-key
DIGITALOCEAN_SPACES_SECRET=your-secret-key
DIGITALOCEAN_SPACES_ENDPOINT=your-endpoint
DIGITALOCEAN_SPACES_REGION=your-region
DIGITALOCEAN_SPACES_BUCKET=your-bucket
DIGITALOCEAN_SPACES_CDN=your-cdn-url

# Email (Mailgun)
MAILGUN_USERNAME=your-username
MAILGUN_FROM=noreply@yourdomain.com
MAILGUN_TOKEN=your-api-token
MAILGUN_DOMAIN=your-domain

# AI (Anthropic)
ANTHROPIC_API_KEY=your-api-key
```

## Complete Example

See the [Basic Setup Example](../examples/basic-setup.md) for a complete working configuration. 