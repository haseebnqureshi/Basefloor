## Example minapi.config.js

```
module.exports = (API) => {
  return {
    "project": {
      name: 'api.example.com',
      env: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 4000,
      checks: false,
      app: {
        name: 'Example',
        secret: process.env.APP_SECRET,
        author: {
          name: 'Example LLC',
          email: 'hello@example.com',
        },
        urls: {
          verify: process.env.APP_URLS_VERIFY,
        }
      },
    },
    "db": "@mongodb/db",
    "middlewares": {
      limit: process.env.REQUEST_SIZE_LIMIT || '10mb',
      cors: true,
      extended: false,
    },
    "files": {
      enabled: true,
      provider: "@digitalocean/files",
    },
    "emails": {
      enabled: false,
      provider: "@mailgun/emails",
    },
    "ai": {
      enabled: true,
      providers: {
        "Anthropic": "@anthropic/ai",
      }
    },
    "providers": {
      "@anthropic/ai": {
        apiKey: process.env.ANTHROPIC_API_KEY,
        models: {
          default: 'claude-3-5-sonnet-20241022',
        },
      },
      "@digitalocean/files": {
        access: process.env.DIGITALOCEAN_SPACES_ACCESS,
        secret: process.env.DIGITALOCEAN_SPACES_SECRET,
        endpoint: process.env.DIGITALOCEAN_SPACES_ENDPOINT,
        region: process.env.DIGITALOCEAN_SPACES_REGION,
        bucket: process.env.DIGITALOCEAN_SPACES_BUCKET,
        cdn: process.env.DIGITALOCEAN_SPACES_CDN,
      },
      "@mailgun/emails": {
        username: process.env.MAILGUN_USERNAME,
        from: process.env.MAILGUN_FROM,
        token: process.env.MAILGUN_TOKEN,
        domain: process.env.MAILGUN_DOMAIN,
      },
      "@postmark/emails": {
        from: process.env.MAILGUN_FROM,
        token: process.env.MAILGUN_TOKEN,
      },
      "@mongodb/db": {
        host: process.env.MONGODB_HOST,
        username: process.env.MONGODB_USERNAME,
        password: process.env.MONGODB_PASSWORD,
        appName: process.env.MONGODB_APPNAME,
        database: process.env.MONGODB_DATABASE,
      },
    },
    "models": {
      "Users": {
        collection: 'user',
        labels: ['User', 'Users'],
        filters: {
          where: w => ({ ...w }),
          update: body => ({ ...body }),
          values: row => ({ ...row }),
        },
        values: {
          _id: ['ObjectId', 'rd'],
          username: ['String', 'cru'],
          email: ['String', 'cru'],
          password_hash: ['String', 'c'],
          role: ['String', 'cru'],
          profile_image: ['ObjectId', 'cru'],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r'],
        }
      },
      "Posts": {
        collection: 'post',
        labels: ['Post', 'Posts'],
        values: {
          _id: ['ObjectId', 'rd'],
          title: ['String', 'cru'],
          content: ['String', 'cru'],
          image: ['ObjectId', 'cru'],
          user_id: ['ObjectId', 'cr'],
          status: ['String', 'cru'],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r'],
        }
      },
      "Comments": {
        collection: 'comment',
        labels: ['Comment', 'Comments'],
        values: {
          _id: ['ObjectId', 'rd'],
          content: ['String', 'cru'],
          post_id: ['ObjectId', 'cr'],
          user_id: ['ObjectId', 'cr'],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r'],
        }
      }
    },

    routes() {
      const where = '_id'
      const isAdmin = `admin=@_user.role`
      const isAuthor = `@_user._id=@{collection}.user_id`
      const isAuthenticated = `@_user._id`

      return {
        "/users(Users)": {
          c: { allow: true }, // Allow registration
          rA: { allow: isAdmin }, // Only admins can list all users
          r: { where, allow: isAuthenticated }, // Users can view their own profile
          u: { where, allow: { or: [isAdmin, isAuthor] } }, // Admin or self can update
          d: { where, allow: isAdmin }, // Only admin can delete users
        },

        "/posts(Posts)": {
          c: { allow: isAuthenticated }, // Logged in users can create posts
          rA: { allow: true }, // Anyone can view all posts
          r: { where, allow: true }, // Anyone can view specific post
          u: { where, allow: { or: [isAdmin, isAuthor] } }, // Admin or author can update
          d: { where, allow: { or: [isAdmin, isAuthor] } }, // Admin or author can delete
        },

        "/posts/comments(Comments)": {
          c: { allow: isAuthenticated }, // Logged in users can comment
          rA: { allow: true }, // Anyone can view comments
          r: { where, allow: true }, // Anyone can view specific comment
          u: { where, allow: { or: [isAdmin, isAuthor] } }, // Admin or author can update
          d: { where, allow: { or: [isAdmin, isAuthor] } }, // Admin or author can delete
        }
      }
    }
  }
}