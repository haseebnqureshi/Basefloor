# Permissions

Basefloor provides a flexible permission system that allows you to control access to your API endpoints with fine-grained rules based on user properties, resource ownership, and custom logic.

## Permission Syntax

Permissions are defined in route configurations using a simple but powerful syntax:

### Basic Permission Types

- `true` - Allow all authenticated users
- `false` - Deny all access
- `'public'` - Allow unauthenticated access (public endpoints)

### User-Based Permissions

Reference authenticated user properties with `@user.field`:

```javascript
{
  allow: '@user.role=admin'  // Only users with role 'admin'
}
```

### Resource-Based Permissions

Reference route parameters with `@_user.field` (where `_user` refers to the route parameter):

```javascript
{
  allow: '@_user.owner_id=@user._id'  // Only allow access to own resources
}
```

## Permission Examples

### Basic User Access

```javascript
{
  routes: [
    {
      _id: '/profile(Users)',
      _read: { 
        allow: '@_user._id=@user._id'  // Users can only read their own profile
      },
      _update: { 
        allow: '@_user._id=@user._id'  // Users can only update their own profile
      }
    }
  ]
}
```

### Admin-Only Access

```javascript
{
  routes: [
    {
      _id: '/admin/users(Users)',
      _readAll: { allow: '@user.role=admin' },
      _create: { allow: '@user.role=admin' },
      _update: { allow: '@user.role=admin' },
      _delete: { allow: '@user.role=admin' }
    }
  ]
} 