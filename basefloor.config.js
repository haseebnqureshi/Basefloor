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
    domain: process.env.DOMAIN || 'localhost'
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
      jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '7d'
      }
    },

    // Email configuration
    email: {
      provider: 'sendgrid',
      from: 'noreply@myapp.com',
      templates: {
        welcome: {
          subject: 'Welcome to {{appName}}!',
          html: '<h1>Welcome {{name}}!</h1>',
          text: 'Welcome {{name}}!'
        }
      }
    },

    // File upload configuration
    files: {
      provider: 'local',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/*', 'application/pdf']
    },

    // AI services configuration
    ai: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4'
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: 'claude-3-sonnet-20240229'
      }
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
    routes: (r) => [
      // Authentication routes (built-in)
      r.post('/auth/register', { auth: false }),
      r.post('/auth/login', { auth: false }),

      // User routes
      r.post('/users(Users)', { c: true }),
      r.get('/users(Users)', { rA: true }),
      r.get('/users/:user_id(Users)', { r: true }),
      r.put('/users/:user_id(Users)', { u: true, permissions: ['auth', 'owner'] }),

      // Post routes
      r.post('/posts(Posts)', { c: true, permissions: ['auth'] }),
      r.get('/posts(Posts)', { rA: true }),
      r.get('/posts/:post_id(Posts)', { r: true }),
      r.put('/posts/:post_id(Posts)', { u: true, permissions: ['auth', 'owner'] }),
      r.delete('/posts/:post_id(Posts)', { d: true, permissions: ['auth', 'owner'] })
    ]
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

  // Provider configurations (shared)
  providers: {
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY
    },
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    }
  }
}) 