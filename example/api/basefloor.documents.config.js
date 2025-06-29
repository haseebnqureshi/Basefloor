module.exports = (API) => {
  return {
    // Project configuration (required)
    project: {
      name: 'Basefloor Document Processing Example API',
      port: process.env.PORT || 4000,
      env: process.env.NODE_ENV || 'development',
      app: {
        name: 'Basefloor Document Processing Example API',
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
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/basefloor-documents',
        database: process.env.MONGODB_DATABASE || 'basefloor-documents'
      }
    },
    
    // Authentication configuration - ENABLED
    auth: {
      enabled: true,
      jwt: {
        secret: process.env.JWT_SECRET || 'example-secret-key-change-in-production',
        expiresIn: '24h'
      }
    },
    
    // File management configuration - ENABLED for document uploads
    files: {
      enabled: true,
      provider: 'local',
      local: {
        uploadDir: './uploads',
        maxSize: 50 * 1024 * 1024, // 50MB for documents
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/*'
        ]
      }
    },
    
    // Email configuration - disabled
    emails: {
      enabled: false
    },
    
    // AI configuration - disabled
    ai: {
      enabled: false
    },
    
    // Transcription configuration - disabled
    transcription: {
      enabled: false
    },

    // Models configuration with document-specific models
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
      
      Documents: {
        collection: 'documents',
        labels: ['Document', 'Documents'],
        values: {
          _id: ['ObjectId', 'rd'],
          filename: ['String', 'cru'],
          originalName: ['String', 'cru'],
          size: ['Number', 'cru'],
          mimetype: ['String', 'cru'],
          path: ['String', 'cru'],
          url: ['String', 'cru'],
          user_id: ['ObjectId', 'cr'],
          parent_id: ['ObjectId', 'cru'],
          status: ['String', 'cru', 'uploaded'],
          conversion_format: ['String', 'cru'],
          source_documents: ['Array', 'cru'],
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
      
      DocumentExtractions: {
        collection: 'document_extractions',
        labels: ['Document Extraction', 'Document Extractions'],
        values: {
          _id: ['ObjectId', 'rd'],
          document_id: ['ObjectId', 'cr'],
          user_id: ['ObjectId', 'cr'],
          text_content: ['String', 'cru'],
          word_count: ['Number', 'cru'],
          character_count: ['Number', 'cru'],
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