/**
 * Unified Basefloor Configuration
 * This file configures both BasefloorAPI and BasefloorApp
 */
module.exports = (API) => ({
  // Project-wide configuration
  project: {
    name: 'My Basefloor App',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    domain: process.env.DOMAIN || 'localhost',
    app: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      name: process.env.APP_NAME || 'My Basefloor App',
      author: {
        name: process.env.APP_AUTHOR || 'Your Company',
        email: process.env.APP_AUTHOR_EMAIL || 'support@yourapp.com'
      },
      urls: {
        verify: process.env.VERIFY_URL || 'https://yourapp.com/verify/:token'
      }
    }
  },

  // Database configuration (shared)
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp',
    options: {
      // MongoDB connection options
    }
  },

  // BasefloorAPI configuration
  api: {
    // Authentication configuration
    auth: {
      enabled: true,
      jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '7d'
      }
    },

    // Email configuration - corrected structure
    emails: {
      enabled: true,
      provider: '@postmark/emails', // or '@sendgrid/emails' or '@mailgun/emails'
      templates: {
        welcome: {
          subject: 'Welcome to {{appName}}!',
          html: '<h1>Welcome {{name}}!</h1><p>Thanks for joining {{appName}}.</p>',
          text: 'Welcome {{name}}! Thanks for joining {{appName}}.'
        },
        passwordReset: {
          subject: '{{appName}} - Password Reset',
          html: '<h1>Password Reset</h1><p>Click <a href="{{resetUrl}}">here</a> to reset your password.</p>',
          text: 'Password Reset: {{resetUrl}}'
        },
        emailVerification: {
          subject: '{{appName}} - Email Verification',
          html: '<h1>Email Verification</h1><p>Click <a href="{{verificationUrl}}">here</a> to verify your email.</p>',
          text: 'Email Verification: {{verificationUrl}}'
        }
      }
    },

    // File upload configuration
    files: {
      enabled: true,
      provider: '@aws/files', // or 'local' or '@minio/files' or '@digitalocean/files'
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/*', 'application/pdf']
    },

    // AI services configuration
    ai: {
      enabled: true,
      provider: '@openai/ai', // or '@anthropic/ai' or '@google/ai' or '@ollama/ai'
    },

    // Models definition
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

    // Routes definition
    routes: {
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
        u: { 
          allow: { 
            or: [
              "@post.author_id=@req_user._id",  // Author can update
              "admin=in=@req_user.role"         // Admin can update
            ]
          }
        },
        d: { 
          allow: { 
            or: [
              "@post.author_id=@req_user._id",  // Author can delete
              "admin=in=@req_user.role"         // Admin can delete
            ]
          }
        }
      }
    }
  },

  // BasefloorApp configuration
  app: {
    // Theme configuration
    theme: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      mode: 'light' // 'light', 'dark', or 'auto'
    },

    // Routing configuration
    routing: {
      mode: 'history', // 'history' or 'hash'
      base: '/'
    },

    // Component configuration
    components: {
      prefix: 'Bf', // Component prefix (BfButton, BfForm, etc.)
      global: ['BfButton', 'BfInput', 'BfCard'] // Globally registered components
    }
  },

  // Provider configurations (shared) - corrected structure
  providers: {
    '@postmark/emails': {
      serverToken: process.env.POSTMARK_SERVER_TOKEN || 'your-postmark-token',
      from: process.env.EMAIL_FROM || 'noreply@yourapp.com'
    },
    '@sendgrid/emails': {
      apiKey: process.env.SENDGRID_API_KEY || 'your-sendgrid-key',
      from: process.env.EMAIL_FROM || 'noreply@yourapp.com'
    },
    '@mailgun/emails': {
      apiKey: process.env.MAILGUN_API_KEY || 'your-mailgun-key',
      domain: process.env.MAILGUN_DOMAIN || 'your-domain.com',
      from: process.env.EMAIL_FROM || 'noreply@yourapp.com'
    },
    '@openai/ai': {
      apiKey: process.env.OPENAI_API_KEY,
      models: {
        default: process.env.OPENAI_MODEL || 'gpt-4',
        chat: 'gpt-4',
        completion: 'gpt-3.5-turbo-instruct',
        embedding: 'text-embedding-ada-002'
      }
    },
    '@anthropic/ai': {
      apiKey: process.env.ANTHROPIC_API_KEY,
      models: {
        default: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
        sonnet: 'claude-3-sonnet-20240229',
        haiku: 'claude-3-haiku-20240307',
        opus: 'claude-3-opus-20240229'
      }
    },
    '@google/ai': {
      apiKey: process.env.GOOGLE_AI_API_KEY,
      models: {
        default: process.env.GOOGLE_AI_MODEL || 'gemini-pro',
        pro: 'gemini-pro',
        vision: 'gemini-pro-vision'
      }
    },
    '@google/transcription': {
      credentials: process.env.GOOGLE_CLOUD_CREDENTIALS, // JSON string
      credentials_base64: process.env.GOOGLE_CLOUD_CREDENTIALS_BASE64, // Base64 encoded JSON
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILENAME // Path to service account key file
    },
    '@ollama/ai': {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      models: {
        default: process.env.OLLAMA_MODEL || 'llama2',
        llama2: 'llama2',
        codellama: 'codellama',
        mistral: 'mistral'
      }
    },
    '@aws/files': {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET,
      cdn: process.env.AWS_CLOUDFRONT_URL // Optional CDN URL
    },
    '@digitalocean/files': {
      access: process.env.DO_SPACES_ACCESS_KEY,
      secret: process.env.DO_SPACES_SECRET_KEY,
      region: process.env.DO_SPACES_REGION,
      bucket: process.env.DO_SPACES_BUCKET,
      cdn: process.env.DO_SPACES_CDN_URL
    },
    '@minio/files': {
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
      bucket: process.env.MINIO_BUCKET
    }
  }
}) 