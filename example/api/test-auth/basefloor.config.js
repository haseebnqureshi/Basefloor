module.exports = (API) => {
  return {
    // Project configuration (required)
    project: {
      name: 'Basefloor Test API',
      port: process.env.PORT || 4001,
      env: process.env.NODE_ENV || 'test',
      app: {
        name: 'Basefloor Test API',
        secret: process.env.JWT_SECRET || 'test-secret-key',
        author: {
          name: 'Basefloor',
          email: 'hello@basefloor.app'
        },
        urls: {
          verify: process.env.FRONTEND_URL || 'http://localhost:3000' + '/verify/:token'
        }
      }
    },
    
    // Database configuration - using in-memory for testing
    db: '@memory/db',
    
    // Middlewares configuration
    middlewares: {
      cors: true,
      limit: '50mb',
      extended: false
    },
    
    // Provider configurations
    providers: {
      '@memory/db': {
        // No configuration needed for in-memory
      }
    },
    
    // Authentication configuration - ENABLED for auth testing
    auth: {
      enabled: true,
      jwt: {
        secret: process.env.JWT_SECRET || 'test-secret-key',
        expiresIn: '24h'
      }
    },
    
    // File management configuration - disabled for testing
    files: {
      enabled: false
    },
    
    // Email configuration - disabled for testing
    emails: {
      enabled: false
    },
    
    // AI configuration - disabled for testing
    ai: {
      enabled: false
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
          password_hash: ['String', 'c'],  // Note: using password_hash consistently
          role: ['String', 'cru', 'user'],
          email_verified: ['Boolean', 'cru', false],
          created_at: ['Date', 'r'],
          updated_at: ['Date', 'r']
        },
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
        }
      }
    },
    
    // Routes function (required) - Enable dynamic CRUD routes
    routes: () => {
      return {
        // Dynamic CRUD routes for Users model
        "/users(Users)": {
          c: { allow: "@req_user._id=@req_user._id" },  // Any authenticated user can create
          rA: { allow: "@req_user._id=@req_user._id" },  // Any authenticated user can read all
          r: { allow: "@req_user._id=@req_user._id", where: "_id" },   // Any authenticated user can read individual
          u: { allow: "@user._id=@req_user._id", where: "_id" },  // Users can only update themselves
          d: { allow: "@req_user._id=@req_user._id", where: "_id" }    // Any authenticated user can delete individual (for testing)
        }
      };
    }
  };
};