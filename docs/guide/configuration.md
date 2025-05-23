# Configuration

This guide covers all the configuration options available in MinAPI through the `minapi.config.js` file.

## Configuration File Structure

The `minapi.config.js` file should export a function that receives the API object and returns a configuration object:

```javascript
module.exports = (API) => {
  return {
    // Configuration options go here
  }
}
```

## Core Configuration

### Project Settings

```javascript
{
  project: {
    name: 'my-api',                    // Project name
    port: process.env.PORT || 3000,   // Server port
    env: process.env.NODE_ENV || 'development' // Environment
  }
}
```

### Database Configuration

```javascript
{
  db: '@mongodb/db',
  providers: {
    '@mongodb/db': {
      host: process.env.MONGODB_HOST || 'localhost:27017',
      database: process.env.MONGODB_DATABASE || 'my_db',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    }
  }
}
```

### Authentication & JWT

```javascript
{
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expirations: {
        auth: '7d',      // Authentication token
        verify: '24h',   // Email verification token  
        reset: '1h'      // Password reset token
      }
    }
  }
}
```

## Models Configuration

Define your data models with schema, validation, and filters:

```javascript
{
  models: {
    Users: {
      collection: 'users',
      labels: ['User', 'Users'],
      values: {
        _id: ['ObjectId', 'rud'],
        email: ['String', 'cru'],
        password_hash: ['String', 'c'],
        name: ['String', 'cru'],
        role: ['String', 'cru', 'user'],
        email_verified: ['Boolean', 'cru', false],
        created_at: ['Date', 'r'],
        updated_at: ['Date', 'r']
      },
      filters: {
        // Custom data transformation filters
        values: (values) => {
          // Encrypt sensitive data before storing
          if (values.access_token) {
            values.access_token = API.Utils.tokenEncrypt(values.access_token);
          }
          return values;
        },
        output: (output) => {
          // Transform data when reading
          if (output && output.access_token) {
            output.access_token = API.Utils.tokenDecrypt(output.access_token);
          }
          return output;
        }
      }
    }
  }
}
```

### Field Types and CRUD Operations

Field definitions follow the pattern: `[Type, Operations, DefaultValue?]`

**Types:**
- `String`, `Number`, `Boolean`, `Date`, `ObjectId`, `Array`, `Object`

**Operations:**
- `c`: Create - field can be set during creation
- `r`: Read - field can be read
- `u`: Update - field can be updated  
- `d`: Delete - field can be included in delete conditions
- `A`: Additional operations (like readAll)

## Routes Configuration

Define API endpoints with permissions and validation:

```javascript
{
  routes: [
    {
      _id: '/users(Users)',
      _create: { 
        allow: true,
        require: ['email', 'password']
      },
      _readAll: { 
        allow: '@user.role=admin',
        limit: 50 
      },
      _read: { 
        allow: true, 
        where: '_id' 
      },
      _update: { 
        allow: '@_user._id=@user._id' 
      },
      _delete: { 
        allow: '@user.role=admin' 
      }
    },
    {
      _id: '/users/:userId/posts(Posts)',
      _create: { 
        allow: '@_user._id=@user._id',
        inject: { user_id: '@user._id' }
      },
      _readAll: { allow: true }
    }
  ]
}
```

### Permission Syntax

- `true`: Allow all authenticated users
- `false`: Deny access
- `@user.field=value`: Check user field equals value
- `@_user._id=@user._id`: Check route parameter equals user ID
- Complex conditions with `and`/`or`:

```javascript
{
  allow: {
    and: [
      "@user.role=admin",
      "@organization.ownerId=@user._id"
    ]
  }
}
```

## File Storage Configuration

### Local Storage

```javascript
{
  files: {
    storage: {
      provider: 'local',
      local: {
        uploadDir: './uploads',
        publicPath: '/files'
      }
    }
  }
}
```

### AWS S3 Storage

```javascript
{
  files: {
    storage: {
      provider: 's3',
      s3: {
        bucket: process.env.AWS_BUCKET,
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    }
  }
}
```

## Email Configuration

### Postmark

```javascript
{
  email: {
    provider: 'postmark',
    from: 'noreply@yourdomain.com',
    providers: {
      postmark: {
        serverToken: process.env.POSTMARK_TOKEN
      }
    },
    templates: {
      welcome: 'template-id',
      passwordReset: 'template-id',
      emailVerification: 'template-id'
    }
  }
}
```

### SendGrid

```javascript
{
  email: {
    provider: 'sendgrid',
    from: 'noreply@yourdomain.com',
    providers: {
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY
      }
    }
  }
}
```

## Audio Transcription

```javascript
{
  transcription: {
    enabled: true,
    provider: '@google/transcription'
  },
  providers: {
    '@google/transcription': {
      keyFilename: '/path/to/google-credentials.json',
      // OR
      credentials: process.env.GOOGLE_CREDENTIALS_JSON
    }
  }
}
```

## AI Integration

```javascript
{
  ai: {
    provider: '@anthropic/claude',
    defaultModel: 'claude-3-sonnet'
  },
  providers: {
    '@anthropic/claude': {
      apiKey: process.env.ANTHROPIC_API_KEY
    }
  }
}
```

## Environment Variables

Create a `.env` file in your project root:

```env
# Database
MONGODB_HOST=localhost:27017
MONGODB_DATABASE=my_api_db

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# AWS (if using S3)
AWS_BUCKET=my-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Email (if using Postmark)
POSTMARK_TOKEN=your-postmark-token

# Google Cloud (if using transcription)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# AI (if using Anthropic)
ANTHROPIC_API_KEY=your-anthropic-key
```

## Complete Example

Here's a complete configuration example:

```javascript
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
          role: ['String', 'cru', 'user'],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        }
      },
      
      Posts: {
        collection: 'posts',
        labels: ['Post', 'Posts'],
        values: {
          _id: ['ObjectId', 'rud'],
          user_id: ['ObjectId', 'cru'],
          title: ['String', 'cru'],
          content: ['String', 'cru'],
          published: ['Boolean', 'cru', false],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        }
      }
    },
    
    routes: [
      {
        _id: '/users(Users)',
        _create: { allow: true },
        _readAll: { allow: '@user.role=admin' },
        _read: { allow: true, where: '_id' },
        _update: { allow: '@_user._id=@user._id' },
        _delete: { allow: '@user.role=admin' }
      },
      {
        _id: '/posts(Posts)',
        _create: { 
          allow: true,
          inject: { user_id: '@user._id' }
        },
        _readAll: { allow: true },
        _read: { allow: true, where: '_id' },
        _update: { allow: '@_user.user_id=@user._id' },
        _delete: { allow: '@_user.user_id=@user._id' }
      }
    ],
    
    files: {
      storage: {
        provider: 's3',
        s3: {
          bucket: process.env.AWS_BUCKET,
          region: process.env.AWS_REGION
        }
      }
    },
    
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