# Basefloor Routes Documentation

### Important: Information here is auto-generated and not validated.

## Overview
The Basefloor routing system provides a flexible and secure way to create RESTful API endpoints with built-in authentication, permissions, and hierarchical routing capabilities.

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
      "@organization.ownerId=@req_user._id"
    ]
  }
}
```

Supports:
- Simple equality checks (`=`)
- Array membership (`=in=`)
- AND/OR logic
- Reference to authenticated user (`@req_user`)
- Reference to parent resources

### 4. Database Integration
- Automatic mapping of HTTP methods to database operations
- Built-in parameter extraction and validation
- Consistent error handling and status codes

### 5. Request Body References
In request bodies, you can reference the authenticated user's properties using the `@req_user.{field_name}` syntax:

```js
{
  "title": "My Document",
  "owner_id": "@req_user._id",
  "created_by": "@req_user.email"
}
```

This automatically injects the authenticated user's field values into your request, providing several benefits:
- Makes it easier to associate resources with the current user without having to manually include user information in every request
- Enhances security by allowing user data to be passed safely via the Authorization token, rather than as plain objects in the request body
- Prevents client-side tampering with user identity, as the user data is retrieved from the server's authenticated session

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
- 403: Authorization failed
- 500: Server error

## Route Parameters
- Parameters are automatically extracted from URL paths
- Foreign key relationships are handled automatically
- Parameters can be referenced in permission rules

## User Authentication Integration
- `@req_user` object is available in permission rules
- User properties can be injected into database queries
- User authentication is required for all protected routes

## Health Check
A default health check endpoint is available at `/` that returns:
```json
{
  "message": "healthy"
} 