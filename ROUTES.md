# MinAPI Routes Documentation

### Important: Information here is auto-generated and not validated.

## Overview
The MinAPI routing system provides a flexible and secure way to create RESTful API endpoints with built-in authentication, permissions, and hierarchical routing capabilities.

## Route Configuration
Routes are defined in your configuration using a simplified syntax:

```js
{
  "/parent/path(model)": {
    c: { /* create options */ },
    rA: { /* read all options */ },
    r: { /* read options */ },
    u: { /* update options */ },
    d: { /* delete options */ }
  }
}
```

Where:
- `c` = Create (POST)
- `rA` = Read All (GET)
- `r` = Read Single (GET)
- `u` = Update (PUT)
- `d` = Delete (DELETE)

## Features

### 1. Hierarchical Routing
The system supports nested resources through parent-child relationships in URLs:
- Example: `/organizations/:orgId/projects/:projectId/tasks`
- Parent parameters are automatically included in child routes
- Permissions cascade through the hierarchy

### 2. Authentication & Authorization
Every route includes:
- Token-based authentication
- User verification
- Granular permission controls

### 3. Permission System
Permissions can be defined using a flexible syntax:

```js
{
  allow: {
    and: [
      "@user.role=admin",
      "@organization.ownerId=@user._id"
    ]
  }
}
```

Supports:
- Simple equality checks (`=`)
- Array membership (`=in=`)
- AND/OR logic
- Reference to authenticated user (`@_user`)
- Reference to parent resources

### 4. Database Integration
- Automatic mapping of HTTP methods to database operations
- Built-in parameter extraction and validation
- Consistent error handling and status codes

## HTTP Method Mapping

| Route Option | HTTP Method | Database Operation |
|--------------|-------------|-------------------|
| `c`          | POST        | create           |
| `rA`         | GET         | readAll          |
| `r`          | GET         | read             |
| `u`          | PUT         | update           |
| `d`          | DELETE      | delete           |

## Response Status Codes

- 200: Successful operation
- 404: Resource not found
- 422: Authorization failed
- 500: Server error

## Health Check
A default health check endpoint is available at `/` that returns:
```json
{
  "message": "healthy"
} 