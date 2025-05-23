# Quick Start

This guide will help you get your first MinAPI project up and running in just a few minutes.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Basic knowledge of JavaScript

## Step 1: Create a New Project

```bash
mkdir my-minapi-project
cd my-minapi-project
npm init -y
```

## Step 2: Install MinAPI

```bash
npm install @hq/minapi
```

## Step 3: Create Configuration

Create a `minapi.config.js` file:

```javascript
module.exports = (API) => {
  return {
    project: {
      name: 'my-api',
      port: process.env.PORT || 3000,
      env: process.env.NODE_ENV || 'development'
    },
    db: '@mongodb/db',
    providers: {
      '@mongodb/db': {
        host: process.env.MONGODB_HOST || 'localhost:27017',
        database: process.env.MONGODB_DATABASE || 'my_api_db'
      }
    },
    models: {
      Users: {
        collection: 'users',
        labels: ['User', 'Users'],
        values: {
          _id: ['ObjectId', 'rud'],
          email: ['String', 'cru'],
          name: ['String', 'cru'],
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

## Step 4: Create Your Main File

Create an `index.js` file:

```javascript
const MinAPI = require('@hq/minapi')
const path = require('path')

const api = MinAPI({
  projectPath: __dirname,
  envPath: path.resolve(__dirname, '.env')
})

api.Init()
api.Start()
```

## Step 5: Create Environment File

Create a `.env` file:

```env
NODE_ENV=development
PORT=3000
MONGODB_HOST=localhost:27017
MONGODB_DATABASE=my_api_db
JWT_SECRET=your-secret-key-here
```

## Step 6: Start Your API

```bash
node index.js
```

Your API should now be running at `http://localhost:3000`!

## Test Your API

You can test your new API with curl:

```bash
# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'

# Get all users
curl http://localhost:3000/users

# Get a specific user (replace :id with actual user ID)
curl http://localhost:3000/users/:id
```

## Next Steps

- [Installation Guide](./installation) - Learn about system requirements and advanced installation
- [Configuration Reference](./configuration) - Explore all configuration options
- [Models Documentation](../reference/models) - Deep dive into data modeling 