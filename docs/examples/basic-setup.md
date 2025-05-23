# Basic Setup Example

This example shows how to create a minimal MinAPI project with basic CRUD operations.

## Project Structure

```
my-api/
├── minapi.config.js
├── index.js
├── package.json
└── .env
```

## Configuration

```javascript
// minapi.config.js
module.exports = (API) => {
  return {
    project: {
      name: 'basic-api',
      port: process.env.PORT || 3000
    },
    
    db: '@mongodb/db',
    providers: {
      '@mongodb/db': {
        host: process.env.MONGODB_HOST || 'localhost:27017',
        database: process.env.MONGODB_DATABASE || 'basic_api'
      }
    },
    
    models: {
      Users: {
        collection: 'users',
        labels: ['User', 'Users'],
        values: {
          _id: ['ObjectId', 'rud'],
          name: ['String', 'cru'],
          email: ['String', 'cru'],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        }
      }
    },
    
    routes: [
      {
        _id: '/users(Users)',
        _create: { allow: true },
        _readAll: { allow: true },
        _read: { allow: true, where: '_id' },
        _update: { allow: true, where: '_id' },
        _delete: { allow: true, where: '_id' }
      }
    ]
  }
}
```

## Testing the API

Once running, you can test with:

```bash
# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Get all users
curl http://localhost:3000/users

# Get specific user
curl http://localhost:3000/users/USER_ID
``` 