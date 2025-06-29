module.exports = (API) => {
  return {
    // API Configuration
    name: 'Basefloor Comprehensive Example API',
    port: process.env.PORT || 4000,
    env: process.env.NODE_ENV || 'development',
    
    // Database configuration
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/basefloor-comprehensive'
    },
    
    // Authentication configuration
    auth: {
      enabled: true,
      jwt: {
        secret: process.env.JWT_SECRET || 'comprehensive-secret-key-change-in-production',
        expiresIn: '24h'
      }
    },
    
    // CORS configuration
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000'
    },
    
    // File management configuration
    files: {
      enabled: true,
      provider: 'local', // or 'aws', 'minio', 'digitalocean'
      local: {
        uploadDir: './uploads',
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/*', 'text/*', 'application/pdf', 'application/msword']
      }
    },
    
    // Email configuration
    emails: {
      enabled: true,
      provider: 'sendgrid', // or 'mailgun', 'postmark'
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY
      },
      from: process.env.EMAIL_FROM || 'noreply@basefloor.app'
    },
    
    // AI configuration
    ai: {
      enabled: true,
      providers: {
        openai: {
          apiKey: process.env.OPENAI_API_KEY,
          model: 'gpt-3.5-turbo'
        },
        anthropic: {
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: 'claude-3-sonnet-20240229'
        },
        google: {
          apiKey: process.env.GOOGLE_AI_API_KEY,
          model: 'gemini-pro'
        }
      }
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
      },
      
      Files: {
        collection: 'files',
        labels: ['File', 'Files'],
        values: {
          _id: ['ObjectId', 'rd'],
          filename: ['String', 'cru'],
          originalName: ['String', 'cru'],
          size: ['Number', 'cru'],
          mimetype: ['String', 'cru'],
          path: ['String', 'cru'],
          url: ['String', 'cru'],
          user_id: ['ObjectId', 'cr'],
          parent_id: ['ObjectId', 'cru'], // for processed files
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
      
      Conversations: {
        collection: 'conversations',
        labels: ['Conversation', 'Conversations'],
        values: {
          _id: ['ObjectId', 'rd'],
          user_id: ['ObjectId', 'cr'],
          provider: ['String', 'cru'],
          user_message: ['String', 'cru'],
          ai_response: ['String', 'cru'],
          tokens_used: ['Number', 'cru', 0],
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
          }
        }
      },
      
      GeneratedContent: {
        collection: 'generated_content',
        labels: ['Generated Content', 'Generated Contents'],
        values: {
          _id: ['ObjectId', 'rd'],
          user_id: ['ObjectId', 'cr'],
          type: ['String', 'cru'],
          topic: ['String', 'cru'],
          tone: ['String', 'cru'],
          length: ['String', 'cru'],
          content: ['String', 'cru'],
          tokens_used: ['Number', 'cru', 0],
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
          }
        }
      },
      
      EmailLogs: {
        collection: 'email_logs',
        labels: ['Email Log', 'Email Logs'],
        values: {
          _id: ['ObjectId', 'rd'],
          user_id: ['ObjectId', 'cr'],
          to: ['String', 'cru'],
          subject: ['String', 'cru'],
          template: ['String', 'cru'],
          variables: ['Object', 'cru'],
          status: ['String', 'cru'],
          message_id: ['String', 'cru'],
          provider: ['String', 'cru'],
          bulk_send: ['Boolean', 'cru', false],
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
          }
        }
      }
    },

    // Routes - return empty function for individual examples
    routes: () => {
      return {};
    }
  };
}; 