# Blog API Example

This example demonstrates how to build a complete blog API with Basefloor, including users, posts, comments, and authentication.

## Project Overview

The blog API will include:
- User registration and authentication
- Blog post creation and management
- Comments system
- Role-based permissions
- File uploads for images

## Configuration

```javascript
// basefloor.config.js
module.exports = (API) => {
  return {
    project: {
      name: 'blog-api',
      port: process.env.PORT || 3000,
      env: process.env.NODE_ENV || 'development'
    },
    
    db: '@mongodb/db',
    providers: {
      '@mongodb/db': {
        host: process.env.MONGODB_HOST,
        database: process.env.MONGODB_DATABASE
      }
    },
    
    auth: {
      jwt: {
        secret: process.env.JWT_SECRET,
        expirations: {
          auth: '7d',
          verify: '24h',
          reset: '1h'
        }
      }
    },
    
    models: {
      Users: {
        collection: 'users',
        labels: ['User', 'Users'],
        values: {
          _id: ['ObjectId', 'rud'],
          email: ['String', 'cru'],
          password_hash: ['String', 'c'],
          name: ['String', 'cru'],
          bio: ['String', 'cru'],
          role: ['String', 'cru', 'author'],
          email_verified: ['Boolean', 'cru', false],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        }
      },
      
      Posts: {
        collection: 'posts',
        labels: ['Post', 'Posts'],
        values: {
          _id: ['ObjectId', 'rud'],
          title: ['String', 'cru'],
          slug: ['String', 'cru'],
          content: ['String', 'cru'],
          excerpt: ['String', 'cru'],
          featured_image: ['String', 'cru'],
          author_id: ['ObjectId', 'cru'],
          status: ['String', 'cru', 'draft'],
          tags: ['Array', 'cru', []],
          published_at: ['Date', 'cru'],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        }
      },
      
      Comments: {
        collection: 'comments',
        labels: ['Comment', 'Comments'],
        values: {
          _id: ['ObjectId', 'rud'],
          post_id: ['ObjectId', 'cru'],
          author_id: ['ObjectId', 'cru'],
          content: ['String', 'cru'],
          status: ['String', 'cru', 'pending'],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        }
      }
    },
    
    routes: [
      // Authentication routes (built-in)
      {
        _id: '/auth/register',
        // Built-in registration endpoint
      },
      
      // User routes
      {
        _id: '/users(Users)',
        _readAll: { allow: '@user.role=admin' },
        _read: { allow: true, where: '_id' },
        _update: { allow: '@_user._id=@user._id' },
        _delete: { allow: '@user.role=admin' }
      },
      
      // Post routes
      {
        _id: '/posts(Posts)',
        _create: { 
          allow: '@user.role=in=author,admin',
          inject: { author_id: '@user._id' }
        },
        _readAll: { 
          allow: true,  // Public read access
          where: { status: 'published' }  // Only show published posts
        },
        _read: { 
          allow: true, 
          where: '_id' 
        },
        _update: { 
          allow: {
            or: [
              '@user.role=admin',
              '@_post.author_id=@user._id'
            ]
          }
        },
        _delete: { 
          allow: {
            or: [
              '@user.role=admin',
              '@_post.author_id=@user._id'
            ]
          }
        }
      },
      
      // Comments routes
      {
        _id: '/posts/:postId/comments(Comments)',
        _create: { 
          allow: true,
          inject: { 
            author_id: '@user._id',
            post_id: '@postId'
          }
        },
        _readAll: { 
          allow: true,
          where: { status: 'approved' }
        },
        _update: { 
          allow: {
            or: [
              '@user.role=admin',
              '@_comment.author_id=@user._id'
            ]
          }
        },
        _delete: { 
          allow: {
            or: [
              '@user.role=admin',
              '@_comment.author_id=@user._id'
            ]
          }
        }
      },
      
      // File upload for images
      {
        _id: '/upload/images',
        _create: { 
          allow: '@user.role=in=author,admin'
        }
      }
    ],
    
    email: {
      provider: 'postmark',
      from: 'noreply@myblog.com',
      providers: {
        postmark: {
          serverToken: process.env.POSTMARK_TOKEN
        }
      }
    }
  }
}
```

## Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_HOST=localhost:27017
MONGODB_DATABASE=blog_api
JWT_SECRET=your-super-secret-jwt-key
POSTMARK_TOKEN=your-postmark-token
```

## API Usage Examples

### User Registration

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "password": "securepassword",
    "name": "John Author",
    "bio": "Passionate writer and developer"
  }'
```

### Create a Blog Post

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Blog Post",
    "slug": "my-first-blog-post",
    "content": "This is the content of my first blog post...",
    "excerpt": "A brief excerpt of the post",
    "status": "published",
    "tags": ["tutorial", "basefloor"]
  }'
```

### Get All Published Posts

```bash
curl http://localhost:3000/posts
```

### Add a Comment

```bash
curl -X POST http://localhost:3000/posts/POST_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Great post! Thanks for sharing."
  }'
```

### Upload an Image

```bash
curl -X POST http://localhost:3000/upload/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

## Features Demonstrated

This blog API example showcases:

1. **User Authentication** - Registration, login, and JWT tokens
2. **Role-Based Permissions** - Different access levels for authors and admins
3. **Resource Ownership** - Authors can only edit their own posts
4. **Hierarchical Routes** - Comments nested under posts
5. **Data Injection** - Automatic author_id injection
6. **Public/Private Data** - Public access to published posts, private for drafts
7. **File Uploads** - Image upload for blog posts
8. **Email Integration** - User verification emails

## Next Steps

You can extend this example by adding:
- Categories and taxonomies
- Search functionality
- Rich text editor integration
- Social media sharing
- SEO optimization
- Comment moderation
- User profiles with avatars 