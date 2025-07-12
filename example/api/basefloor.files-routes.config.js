module.exports = (API) => {
  return {
    // Project configuration (required)
    project: {
      name: 'BasefloorAPI Files Routes Test',
      port: process.env.PORT || 4000,
      env: process.env.NODE_ENV || 'development',
      app: {
        name: 'BasefloorAPI Files Routes Test',
        secret: process.env.JWT_SECRET || 'files-routes-secret',
        author: {
          name: 'Basefloor',
          email: 'hello@basefloor.app'
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
      '@memory/db': {},
      '@minio/files': {
        endPoint: process.env.MINIO_ENDPOINT || 'localhost',
        port: parseInt(process.env.MINIO_PORT) || 9000,
        useSSL: process.env.MINIO_USE_SSL === 'true',
        access: process.env.MINIO_ACCESS_KEY || 'miniouser',
        secret: process.env.MINIO_SECRET_KEY || 'miniopassword',
        bucket: process.env.MINIO_BUCKET || 'basefloor-test',
        region: 'us-east-1'
      }
    },
    
    // Authentication configuration
    auth: {
      enabled: true,
      jwt: {
        secret: process.env.JWT_SECRET || 'files-routes-secret',
        expiresIn: '24h'
      }
    },
    
    // File management configuration - ENABLED with minimal setup
    files: {
      enabled: true,
      provider: '@minio/files'
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
      
      Files: {
        collection: 'files',
        labels: ['File', 'Files'],
        values: {
          _id: ['ObjectId', 'rd'],
          name: ['String', 'cru'],
          filename: ['String', 'cru'],
          size: ['Number', 'cru'],
          content_type: ['String', 'cru'],
          hash: ['String', 'cru'],
          key: ['String', 'cru'],
          extension: ['String', 'cru'],
          user_id: ['ObjectId', 'cr'],
          parent_id: ['ObjectId', 'cru'],
          uploaded_at: ['Date', 'cru'],
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