---
layout: default
title: Basic Setup Example
---

# Basic MinAPI Setup Example

This example demonstrates a complete setup for a blog API with user authentication, posts, and comments.

## Project Structure

```
my-blog-api/
├── node_modules/
├── .env
├── minapi.config.js
├── index.js
└── package.json
```

## Package.json

```json
{
  "name": "my-blog-api",
  "version": "1.0.0",
  "description": "A blog API built with MinAPI",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "@hq/minapi": "^2.5.3",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## .env

```
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_HOST=mongodb://localhost:27017
MONGODB_DATABASE=my_blog_db

# Authentication
JWT_SECRET=your-secure-jwt-secret

# Application
APP_NAME=My Blog API
APP_URL_VERIFY=http://localhost:3000/verify/:token
```

## index.js

```javascript
const MinAPI = require('@hq/minapi');
const path = require('path');

const api = MinAPI({
  projectPath: __dirname,
  envPath: path.resolve(__dirname, '.env')
});

// Initialize the API
api.Init();

// Start the server
api.Start();

console.log(`Server running on port ${process.env.PORT || 3000}`);
```

## minapi.config.js

```javascript
module.exports = (API) => {
  return {
    project: {
      name: 'my-blog-api',
      env: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000,
      app: {
        name: process.env.APP_NAME || 'My Blog API',
        secret: process.env.JWT_SECRET,
        author: {
          name: 'Your Name',
          email: 'your@email.com',
        },
        urls: {
          verify: process.env.APP_URL_VERIFY,
        }
      }
    },
    
    // Middlewares
    middlewares: {
      limit: '10mb',
      cors: true,
      extended: true,
    },
    
    // Database
    db: '@mongodb/db',
    
    // Authentication
    auth: {
      enabled: true,
      jwt: {
        expirations: {
          auth: '7d',
          verify: '24h',
          reset: '1h'
        }
      }
    },
    
    // Providers
    providers: {
      '@mongodb/db': {
        host: process.env.MONGODB_HOST,
        database: process.env.MONGODB_DATABASE
      }
    },
    
    // Models
    models: {
      // Users model
      Users: {
        collection: 'user',
        labels: ['User', 'Users'],
        filters: {
          // Remove password_hash from output
          output: (output) => {
            if (output) {
              delete output.password_hash;
            }
            return output;
          },
          // Add timestamps on creation
          create: {
            values: (values) => {
              values.created_at = new Date();
              values.updated_at = new Date();
              return values;
            }
          },
          // Update timestamp on update
          update: {
            values: (values) => {
              values.updated_at = new Date();
              return values;
            }
          }
        },
        values: {
          _id: ['ObjectId', 'rd'],
          email: ['String', 'cru'],
          password_hash: ['String', 'c'],
          name: ['String', 'cru'],
          bio: ['String', 'cru'],
          role: ['String', 'cru', 'user'],
          email_verified: ['Boolean', 'cru', false],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        }
      },
      
      // Posts model
      Posts: {
        collection: 'post',
        labels: ['Post', 'Posts'],
        filters: {
          create: {
            values: (values) => {
              values.created_at = new Date();
              values.updated_at = new Date();
              values.status = values.status || 'draft';
              return values;
            }
          },
          update: {
            values: (values) => {
              values.updated_at = new Date();
              return values;
            }
          }
        },
        values: {
          _id: ['ObjectId', 'rd'],
          title: ['String', 'cru'],
          content: ['String', 'cru'],
          user_id: ['ObjectId', 'cr'],
          status: ['String', 'cru', 'draft'],
          tags: ['Array', 'cru'],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        }
      },
      
      // Comments model
      Comments: {
        collection: 'comment',
        labels: ['Comment', 'Comments'],
        filters: {
          create: {
            values: (values) => {
              values.created_at = new Date();
              values.updated_at = new Date();
              return values;
            }
          },
          update: {
            values: (values) => {
              values.updated_at = new Date();
              return values;
            }
          }
        },
        values: {
          _id: ['ObjectId', 'rd'],
          content: ['String', 'cru'],
          post_id: ['ObjectId', 'cr'],
          user_id: ['ObjectId', 'cr'],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        }
      }
    },
    
    // Routes
    routes() {
      // Common permissions
      const where = '_id';
      const isAdmin = `admin=@_user.role`;
      const isAuthor = `@_user._id=@{collection}.user_id`;
      const isAuthenticated = `@_user._id`;
      
      return {
        // User routes
        "/users(Users)": {
          c: { allow: true },  // Anyone can register
          rA: { allow: isAdmin },  // Only admins can list all users
          r: { where, allow: true },  // Anyone can view user profiles
          u: { where, allow: { or: [isAdmin, '@_user._id=@user._id'] } },  // Admin or self can update
          d: { where, allow: isAdmin }  // Only admin can delete users
        },
        
        // Post routes
        "/posts(Posts)": {
          c: { allow: isAuthenticated },  // Logged in users can create posts
          rA: { allow: true },  // Anyone can view all posts
          r: { where, allow: true },  // Anyone can view a specific post
          u: { where, allow: { or: [isAdmin, isAuthor] } },  // Admin or author can update
          d: { where, allow: { or: [isAdmin, isAuthor] } },  // Admin or author can delete
          
          // Comments as nested resource
          "/comments(Comments)": {
            c: { allow: isAuthenticated },  // Logged in users can comment
            rA: { allow: true },  // Anyone can view comments
            r: { where, allow: true },  // Anyone can view a specific comment
            u: { where, allow: { or: [isAdmin, isAuthor] } },  // Admin or author can update
            d: { where, allow: { or: [isAdmin, isAuthor] } }  // Admin or author can delete
          }
        },
        
        // Custom route for user profile
        "/profile": {
          r: {
            allow: isAuthenticated,
            handler: async (req, res) => {
              try {
                // Get user with their posts
                const user = await API.DB.Users.read({ _id: req.user._id });
                const posts = await API.DB.Posts.readAll({ user_id: req.user._id });
                
                res.json({
                  user,
                  posts,
                  postCount: posts.length
                });
              } catch (error) {
                res.status(500).json({ error: error.message });
              }
            }
          }
        },
        
        // Public stats route
        "/stats": {
          r: {
            allow: true,
            handler: async (req, res) => {
              try {
                const userCount = await API.DB.Users.count({});
                const postCount = await API.DB.Posts.count({ status: 'published' });
                const commentCount = await API.DB.Comments.count({});
                
                res.json({
                  users: userCount,
                  posts: postCount,
                  comments: commentCount,
                  lastUpdated: new Date()
                });
              } catch (error) {
                res.status(500).json({ error: error.message });
              }
            }
          }
        }
      };
    }
  };
};
```

## Using the API

### Start the API

```bash
npm install
npm start
```

### Register a User

```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

### Login

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Create a Post

```http
POST http://localhost:3000/posts
Content-Type: application/json
Authorization: Bearer your_token_here

{
  "title": "My First Post",
  "content": "This is my first post using MinAPI!",
  "tags": ["minapi", "tutorial"],
  "status": "published"
}
```

### Add a Comment

```http
POST http://localhost:3000/posts/post_id/comments
Content-Type: application/json
Authorization: Bearer your_token_here

{
  "content": "Great post! Thanks for sharing."
}
```

### View Profile

```http
GET http://localhost:3000/profile
Authorization: Bearer your_token_here
```

## Next Steps

To extend this example:

1. Add file uploads for post images
2. Implement email notifications
3. Add search functionality
4. Implement post categories
5. Add pagination for posts and comments 