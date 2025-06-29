module.exports = (API) => {
  return {
    // Project configuration (required)
    project: {
      name: 'Basefloor Authentication Example API',
      port: process.env.PORT || 4000,
      env: process.env.NODE_ENV || 'development',
      app: {
        name: 'Basefloor Authentication Example API',
        secret: process.env.JWT_SECRET || 'example-secret-key-change-in-production',
        author: {
          name: 'Basefloor',
          email: 'hello@basefloor.app'
        },
        urls: {
          verify: process.env.FRONTEND_URL || 'http://localhost:3000' + '/verify/:token'
        }
      }
    },
    
    // Database configuration
    db: '@mongodb/local-db',
    
    // Middlewares configuration
    middlewares: {
      cors: true,
      limit: '50mb',
      extended: false
    },
    
    // Provider configurations
    providers: {
      '@mongodb/local-db': {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/basefloor-example',
        database: process.env.MONGODB_DATABASE || 'basefloor-example'
      }
    },
    
    // Authentication configuration - ENABLED for auth examples
    auth: {
      enabled: true,
      jwt: {
        secret: process.env.JWT_SECRET || 'example-secret-key-change-in-production',
        expiresIn: '24h'
      }
    },
    
    // File management configuration - disabled
    files: {
      enabled: false
    },
    
    // Email configuration - disabled
    emails: {
      enabled: false
    },
    
    // AI configuration - disabled
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
          password: ['String', 'c'],
          role: ['String', 'cru', 'user'],
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
      },
      
      Tasks: {
        collection: 'tasks',
        labels: ['Task', 'Tasks'],
        values: {
          _id: ['ObjectId', 'rd'],
          title: ['String', 'cru'],
          description: ['String', 'cru'],
          completed: ['Boolean', 'cru', false],
          due_date: ['Date', 'cru'],
          user_id: ['ObjectId', 'cr'],
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
    
    // Routes function (required)
    routes: () => {
      return {};
    }
  };
}; 