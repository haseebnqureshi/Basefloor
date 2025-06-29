module.exports = (API) => {
  return {
    // Project configuration (required)
    project: {
      name: 'Basefloor Audio Transcription Example API',
      port: process.env.PORT || 4000,
      env: process.env.NODE_ENV || 'development',
      app: {
        name: 'Basefloor Audio Transcription Example API',
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
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/basefloor-transcription',
        database: process.env.MONGODB_DATABASE || 'basefloor-transcription'
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
    
    // File management configuration - ENABLED for audio uploads
    files: {
      enabled: true,
      provider: 'local',
      local: {
        uploadDir: './uploads',
        maxSize: 100 * 1024 * 1024, // 100MB for audio files
        allowedTypes: ['audio/*', 'video/*']
      }
    },
    
    // Transcription configuration - ENABLED
    transcription: {
      enabled: true,
      provider: '@google/transcription',
      google: {
        apiKey: process.env.GOOGLE_CLOUD_API_KEY,
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
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

    // Models configuration with transcription-specific models
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
      
      AudioFiles: {
        collection: 'audio_files',
        labels: ['Audio File', 'Audio Files'],
        values: {
          _id: ['ObjectId', 'rd'],
          filename: ['String', 'cru'],
          originalName: ['String', 'cru'],
          size: ['Number', 'cru'],
          mimetype: ['String', 'cru'],
          path: ['String', 'cru'],
          url: ['String', 'cru'],
          user_id: ['ObjectId', 'cr'],
          status: ['String', 'cru', 'uploaded'],
          transcription_id: ['ObjectId', 'cru'],
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
      
      Transcriptions: {
        collection: 'transcriptions',
        labels: ['Transcription', 'Transcriptions'],
        values: {
          _id: ['ObjectId', 'rd'],
          audio_file_id: ['ObjectId', 'cr'],
          user_id: ['ObjectId', 'cr'],
          language: ['String', 'cru', 'en-US'],
          text: ['String', 'cru'],
          confidence: ['Number', 'cru'],
          words: ['Array', 'cru'],
          status: ['String', 'cru', 'pending'],
          provider: ['String', 'cru', 'google'],
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