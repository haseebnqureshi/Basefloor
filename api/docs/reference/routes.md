---
layout: default
title: Routes Reference
---

# MinAPI Routes Reference

The MinAPI routing system provides a flexible and secure way to create RESTful API endpoints with built-in authentication, permissions, and hierarchical routing capabilities.

## Route Definition

Routes are defined in the `routes` function of your `minapi.config.js` file:

```javascript
routes() {
  return {
    "/path(Model)": {
      c: { /* create options */ },
      rA: { /* read all options */ },
      r: { /* read options */ },
      u: { /* update options */ },
      d: { /* delete options */ }
    }
  }
}
```

MinAPI internally converts these shorthand notations (`c`, `rA`, `r`, `u`, `d`) to longer form method names (`_create`, `_readAll`, `_read`, `_update`, `_delete`).

## Route Path Syntax

MinAPI provides a concise yet powerful syntax for defining routes:

- **Basic path**: `/path`
- **With parameters**: `/path/:param`
- **With model**: `/path(ModelName)` - Connects route to a database model
- **Nested routes**: `/parent/:parentId/child/:childId`

When using the model syntax `/path(ModelName)`, MinAPI automatically connects the route to the specified model for CRUD operations.

### Parameter Extraction

Parameters in paths (like `:param`) are automatically extracted and used to build database queries. MinAPI automatically constructs appropriate `where` conditions based on these parameters.

## HTTP Method Mapping

Each route option maps to a specific HTTP method and database operation:

| Route Option | Internal Name | HTTP Method | Database Operation | Description |
|--------------|---------------|-------------|-------------------|-------------|
| `c`          | `_create`     | POST        | create           | Create a new resource |
| `rA`         | `_readAll`    | GET         | readAll          | Get multiple resources |
| `r`          | `_read`       | GET         | read             | Get a single resource |
| `u`          | `_update`     | PUT         | update           | Update a resource |
| `d`          | `_delete`     | DELETE      | delete           | Delete a resource |

## Route Options

Each route option can include the following properties:

```javascript
r: {
  where: '_id',  // Field to match URL parameter against
  allow: true,   // Permission rule
  filter: ['field1=@req_user._id'],  // Additional filtering conditions
  // Additional options...
}
```

### where

Specifies which parameter from the URL to use when querying the database:

```javascript
r: {
  where: '_id'  // Match against document ID
}
```

MinAPI automatically constructs param names using the collection name and the field (e.g., `user_id` for Users model with `_id` field).

### allow

Defines permission rules for the route. MinAPI processes these rules to determine if access is allowed:

```javascript
// Allow everyone
r: {
  allow: true
}

// Deny everyone
r: {
  allow: false
}

// Only owner can access
r: {
  allow: '@_user._id=@resource.user_id'
}

// Only admin can access
r: {
  allow: 'admin=@_user.role'
}

// Only users in specific group
r: {
  allow: 'admin=in=@_user.roles'
}

// Logical operations
r: {
  allow: {
    and: [
      '@_user._id=@resource.user_id',
      'active=@resource.status'
    ]
  }
}

r: {
  allow: {
    or: [
      '@_user._id=@resource.user_id',
      'admin=@_user.role'
    ]
  }
}
```

Permission rules are evaluated recursively for complex conditions, checking values from the authenticated user and loaded resources.

### filter

Filters provide additional query conditions based on the current request context:

```javascript
r: {
  filter: '@resource.user_id=@req_user._id'  // Only return resources owned by the current user
}

// Multiple filters can be combined
r: {
  filter: [
    '@resource.status=active',
    '@resource.organization_id=@req_user.organization_id'
  ]
}
```

Filters are processed and added to the database query `where` conditions.

## Hierarchical Routing

MinAPI supports nested resources through parent-child relationships in URLs:

```javascript
routes() {
  return {
    "/organizations(Organizations)": {
      c: { allow: '@_user._id' },
      r: { where: '_id', allow: '@_user._id=@organization.owner_id' },
      
      "/projects(Projects)": {
        c: { allow: '@_user._id=@organization.owner_id' },
        r: { where: '_id', allow: '@_user._id=@project.user_id' },
        
        "/tasks(Tasks)": {
          c: { allow: '@_user._id=@project.user_id' },
          r: { where: '_id', allow: '@_user._id=@task.assigned_to' }
        }
      }
    }
  }
}
```

The implementation:
1. Identifies parent-child relationships in the route structure
2. Automatically incorporates parent parameters into child routes
3. Makes parent resource data available to permission and filter rules
4. Constructs complete URL paths with all parent segments

## User Property Injection

In request bodies, you can reference the authenticated user's properties using the `@req_user.{field_name}` syntax:

```javascript
// In client-side request
{
  "title": "My Document",
  "owner_id": "@req_user._id",
  "created_by": "@req_user.email"
}
```

MinAPI automatically replaces these references with actual values from the authenticated user object before processing the request.

## Authentication Integration

All routes have access to the authenticated user through the `@_user` or `@req_user` object in permission rules:

```javascript
routes() {
  return {
    "/profile": {
      r: {
        allow: '@_user._id',  // Must be authenticated
        handler: async (req, res) => {
          // The authenticated user is available in req.user
          res.json(req.user);
        }
      }
    }
  }
}
```

By default, MinAPI attaches authentication middleware to all routes.

## Custom Route Handlers

While MinAPI provides automatic CRUD operations, you can also define custom route handlers:

```javascript
routes() {
  return {
    "/custom-action": {
      r: {
        allow: '@_user._id',
        handler: async (req, res) => {
          // Custom logic here
          const result = await doSomething();
          res.json(result);
        }
      }
    }
  }
}
```

## Response Status Codes

MinAPI automatically sets appropriate status codes based on the operation result:

- **200 OK**: Successful operation with data returned
- **404 Not Found**: Resource not found
- **403 Forbidden**: Authorization failed
- **500 Server Error**: Server-side error or undefined result

## Example: Complete Routing Configuration

```javascript
routes() {
  const where = '_id'
  const isAdmin = `admin=@_user.role`
  const isOwner = `@_user._id=@resource.user_id`
  
  return {
    // User management
    "/users(Users)": {
      c: { allow: true },  // Allow signup
      rA: { 
        allow: isAdmin,  // Only admins can list all users
        filter: 'status=active'  // Only show active users
      },
      r: { where, allow: { or: [isAdmin, '@_user._id=@user._id'] } },  // Admin or self
      u: { where, allow: { or: [isAdmin, '@_user._id=@user._id'] } },  // Admin or self
      d: { where, allow: isAdmin }  // Only admin can delete
    },
    
    // Post management with comments as nested resource
    "/posts(Posts)": {
      c: { allow: '@_user._id' },  // Authenticated users can create posts
      rA: { allow: true },  // Anyone can see posts
      r: { where, allow: true },  // Anyone can see a post
      u: { where, allow: { or: [isAdmin, '@_user._id=@post.user_id'] } },  // Admin or author
      d: { where, allow: { or: [isAdmin, '@_user._id=@post.user_id'] } },  // Admin or author
      
      // Comments as a nested resource
      "/comments(Comments)": {
        c: { allow: '@_user._id' },  // Authenticated users can comment
        rA: { allow: true },  // Anyone can see comments
        r: { where, allow: true },  // Anyone can see a comment
        u: { where, allow: { or: [isAdmin, '@_user._id=@comment.user_id'] } },  // Admin or author
        d: { where, allow: { or: [isAdmin, '@_user._id=@comment.user_id'] } }  // Admin or author
      }
    }
  }
} 