# Configuration

This page documents all configuration options for Basefloor.

## Configuration Schema


### name

- **Type**: `string`
- **Required**: No
- **Description**: The name of your API
- **Example**: `My Basefloor API`

### mongodb

- **Type**: `object`
- **Required**: Yes
- **Description**: MongoDB connection configuration

#### Properties

  ### uri

  - **Type**: `string`
  - **Required**: Yes
  - **Description**: MongoDB connection URI
  - **Environment Variable**: `MONGODB_URI`
  - **Example**: `mongodb://localhost:27017/myapp`

### jwt

- **Type**: `object`
- **Required**: Yes
- **Description**: JWT authentication configuration

#### Properties

  ### secret

  - **Type**: `string`
  - **Required**: Yes
  - **Description**: Secret key for JWT token signing
  - **Environment Variable**: `JWT_SECRET`
  - **Example**: `your-secret-key-change-in-production`

### cors

- **Type**: `object`
- **Required**: No
- **Description**: CORS configuration

#### Properties

  ### origin

  - **Type**: `string`
  - **Required**: No
  - **Description**: Allowed CORS origin
  - **Environment Variable**: `FRONTEND_URL`
  - **Example**: `https://yourdomain.com`

### models

- **Type**: `object`
- **Required**: Yes
- **Description**: Model definitions for your API
- **Example**: `{ Users: { ... }, Posts: { ... } }`

### routes

- **Type**: `object`
- **Required**: No
- **Description**: Route definitions with permissions
- **Example**: `{ "/users(Users)": { c: { allow: true }, r: { allow: true } } }`


## Example Configuration

```javascript
module.exports = (API) => {
  return {
    // API Name
    name: 'My Basefloor API',
    
    // Database configuration
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp'
    },
    
    // Authentication configuration
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    },
    
    // CORS configuration
    cors: {
      origin: process.env.FRONTEND_URL || 'https://yourdomain.com'
    },
    
    // Models configuration
    models: {
      // Your models here
    },
    
    // Routes configuration
    routes: {
      // Your routes here
    }
  };
};
```

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|----------|
| MONGODB_URI | MongoDB connection URI | Yes | mongodb://localhost:27017/myapp |
| JWT_SECRET | Secret key for JWT token signing | Yes | your-secret-key-change-in-production |
| FRONTEND_URL | Allowed CORS origin | No | https://yourdomain.com |


---

*Generated on 2025-05-28T14:54:24.679Z*
