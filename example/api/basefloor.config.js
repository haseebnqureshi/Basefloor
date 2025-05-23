module.exports = (API) => {
  return {
    // API Name
    name: 'Basefloor Example API',
    
    // Database configuration
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/basefloor-example'
    },
    
    // Authentication configuration
    jwt: {
      secret: process.env.JWT_SECRET || 'example-secret-key-change-in-production'
    },
    
    // CORS configuration
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000'
    },

    // Models configuration
    models: {
      Users: {
        collection: 'user',
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
        collection: 'task',
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
    }
  };
} 