---
layout: default
title: Getting Started
---

# Getting Started with MinAPI

This guide will walk you through creating a new MinAPI project from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (installed locally or accessible)
- (Optional) LibreOffice for document conversions
- (Optional) Ghostscript for PDF processing

## Step 1: Create a New Project

```bash
# Create project directory
mkdir my-api
cd my-api

# Initialize project
npm init -y
```

## Step 2: Install MinAPI

```bash
npm install @hq/minapi
```

## Step 3: Create Environment Variables

Create a `.env` file in your project root:

```
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_HOST=mongodb://localhost:27017
MONGODB_DATABASE=my_api_db

# Authentication
JWT_SECRET=your-secure-jwt-secret

# Application
APP_NAME=My API
```

## Step 4: Create Configuration File

Create a `minapi.config.js` file in your project root:

```javascript
module.exports = (API) => {
  return {
    project: {
      name: 'my-api',
      env: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000,
      app: {
        name: process.env.APP_NAME || 'MinAPI Application',
        secret: process.env.JWT_SECRET,
        author: {
          name: 'Your Name',
          email: 'your@email.com',
        }
      }
    },
    db: '@mongodb/db',
    providers: {
      '@mongodb/db': {
        host: process.env.MONGODB_HOST,
        database: process.env.MONGODB_DATABASE
      }
    },
    models: {
      Users: {
        collection: 'user',
        labels: ['User', 'Users'],
        values: {
          _id: ['ObjectId', 'rd'],
          email: ['String', 'cru'],
          password_hash: ['String', 'c'],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        }
      }
    },
    routes() {
      return {
        "/users(Users)": {
          c: { allow: true }, // Anyone can create a user
          rA: { allow: true }, // Anyone can read all users
          r: { where: '_id', allow: true }, // Anyone can read a user
          u: { where: '_id', allow: '@_user._id=@user._id' }, // Only the user can update themselves
          d: { where: '_id', allow: '@_user._id=@user._id' } // Only the user can delete themselves
        }
      }
    }
  }
}
```

## Step 5: Create Main Application File

Create an `index.js` file in your project root:

```javascript
const MinAPI = require('@hq/minapi')
const path = require('path')

const api = MinAPI({
  projectPath: __dirname,
  envPath: path.resolve(__dirname, '.env')
})

// Initialize the API
api.Init()

// Start the server
api.Start()
```

## Step 6: Add Script to package.json

Update your `package.json` to include a start script:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

## Step 7: Start Your API

```bash
npm start
```

Your API should now be running at http://localhost:3000. You have a basic API with a `/users` endpoint that supports CRUD operations.

## Next Steps

- [Configure Authentication](./authentication.md) - Set up secure user authentication
- [Define More Models](../reference/models.md) - Create additional data models
- [Add Custom Routes](../reference/routes.md) - Define your API endpoints
- [Explore File Management](../reference/files.md) - Add file upload and processing
- [View Example Projects](../examples/basic-setup.md) - See full example configurations 