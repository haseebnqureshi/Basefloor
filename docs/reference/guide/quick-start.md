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
  
  // Database configuration
  db: '@mongodb/local-db',
  
  // Provider configurations
  providers: {
    '@mongodb/local-db': {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp',
      database: process.env.MONGODB_DATABASE || 'myapp'
    }
  },
  
  // Authentication configuration
  auth: {
    enabled: true,
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      expiresIn: '7d'
    }
  },
  
  // Email configuration (optional)
  emails: {
    enabled: false  // Set to true to enable email services
  },
  
  // AI configuration (optional)
  ai: {
    enabled: false  // Set to true to enable AI services
  },
  
  // Models configuration
  models: {
    Users: {
      collection: 'users',
      labels: ['User', 'Users'],
      values: {
        _id: ['ObjectId', 'rd'],
        name: ['String', 'cru'],
        email: ['String', 'cru'],
        password: ['String', 'c'],
        role: ['String', 'cru', 'user'],
        created_at: ['Date', 'r'],
        updated_at: ['Date', 'r']
      }
    },
    
    Posts: {
      collection: 'posts',
      labels: ['Post', 'Posts'],
      values: {
        _id: ['ObjectId', 'rd'],
        title: ['String', 'cru'],
        content: ['String', 'cru'],
        author_id: ['ObjectId', 'cr'],
        published: ['Boolean', 'cru', false],
        created_at: ['Date', 'r'],
        updated_at: ['Date', 'r']
      }
    }
  },
  
  // Routes configuration
  routes: () => {
    return {
      // User routes
      "/users(Users)": {
        c: { allow: true },  // Anyone can create (register)
        rA: { allow: "admin=in=@req_user.role" },  // Only admins can list all users
        r: { allow: true },  // Anyone can read a user profile
        u: { allow: "@user._id=@req_user._id" },  // Users can only update their own profile
        d: { allow: "admin=in=@req_user.role" }   // Only admins can delete users
      },
      
      // Post routes
      "/posts(Posts)": {
        c: { allow: "@req_user._id" },  // Any authenticated user can create posts
        rA: { allow: true },  // Anyone can list posts
        r: { allow: true },   // Anyone can read a post
        u: { allow: "@post.author_id=@req_user._id" },  // Author can update
        d: { allow: "@post.author_id=@req_user._id" }   // Author can delete
      }
    }
  }
})
```

## Step 4: Create your server

Create an `index.js` file:

```javascript
const BasefloorAPI = require('@basefloor/api')

// Initialize the API with the project path
const API = BasefloorAPI({
  projectPath: __dirname,
  envPath: './.env' // Path to your .env file
})

// Initialize all components based on config
API.Init()

// Start the server
API.Start()
```

## Step 5: Start your server

```bash
node index.js
```

That's it! Your API is now running on `http://localhost:3000` with:

- Full CRUD operations for Users and Posts
- Authentication endpoints (`/register`, `/login`, `/user`, etc.)
- Built-in validation and error handling
- MongoDB integration

## Next Steps

- [Learn about models](/reference/models) to understand data modeling
- [Explore routing](/reference/routes) to create custom endpoints  
- [Set up authentication](/reference/authentication) to secure your API
- [Check out examples](/examples/) for more complex use cases 