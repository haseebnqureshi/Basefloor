# Quick Start

This guide will help you get your first BasefloorAPI project up and running in just a few minutes.

## Prerequisites

- Node.js 16+ installed
- MongoDB instance (local or remote)

## Step 1: Create a new project

```bash
mkdir my-basefloor-project
cd my-basefloor-project
npm init -y
```

## Step 2: Install BasefloorAPI

```bash
npm install @basefloor/api
```

> 💡 **Smart Installation**: BasefloorAPI only installs provider packages you actually configure. No bloated dependencies!

## Step 3: Create your configuration

Create a `basefloor.config.js` file:

```javascript
module.exports = (API) => ({
  project: {
    name: 'My API',
    port: 3000,
    env: 'development'
  },
  
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp'
  },
  
  // 🚀 Only these providers will be installed:
  email: {
    provider: 'sendgrid',
    from: 'noreply@myapp.com'
  },
  
  ai: {
    providers: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4'
      }
    }
  },
  
  models: (m) => [
    m.create('Users', {
      fields: {
        name: { type: 'string', required: true },
        email: { type: 'string', required: true, unique: true },
        role: { type: 'string', default: 'user' }
      }
    }),
    
    m.create('Posts', {
      fields: {
        title: { type: 'string', required: true },
        content: { type: 'string', required: true },
        author: { type: 'objectId', ref: 'Users', required: true },
        published: { type: 'boolean', default: false }
      }
    })
  ],
  
  routes: (r) => [
    // User routes
    r.post('/users(Users)', { c: true }),
    r.get('/users(Users)', { rA: true }),
    r.get('/users/:user_id(Users)', { r: true }),
    
    // Post routes  
    r.post('/posts(Posts)', { c: true, permissions: ['auth'] }),
    r.get('/posts(Posts)', { rA: true }),
    r.get('/posts/:post_id(Posts)', { r: true }),
    r.put('/posts/:post_id(Posts)', { u: true, permissions: ['auth', 'owner'] }),
    r.delete('/posts/:post_id(Posts)', { d: true, permissions: ['auth', 'owner'] })
  ]
})
```

## Step 4: Create your server

Create an `index.js` file:

```javascript
const BasefloorAPI = require('@basefloor/api')

const api = BasefloorAPI({
  config: require('./basefloor.config.js')
})
```

## Step 5: Start your server

```bash
node index.js
```

That's it! Your API is now running on `http://localhost:3000` with:

- Full CRUD operations for Users and Posts
- Authentication endpoints (`/auth/register`, `/auth/login`, etc.)
- Built-in validation and error handling
- MongoDB integration

## Next Steps

- [Learn about models](/reference/models) to understand data modeling
- [Explore routing](/reference/routes) to create custom endpoints  
- [Set up authentication](/reference/authentication) to secure your API
- [Check out examples](/examples/) for more complex use cases 