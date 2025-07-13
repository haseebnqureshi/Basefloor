// Express-First Basefloor Configuration
// Simple, focused configuration for models and basic settings

module.exports = (API) => {
  return {
    project: {
      name: 'Express-First Todo API',
      port: 4001,
      env: process.env.NODE_ENV || 'development',
      app: {
        secret: process.env.JWT_SECRET || 'your-secret-key-here'
      }
    },

    // Simple model definitions
    models: {
      Users: {
        collection: 'users',
        values: {
          _id: ['ObjectId', 'rud'],
          email: ['String', 'cru'],
          password_hash: ['String', 'cru'],
          created_at: ['Date', 'cr', Date.now]
        }
      },
      Todos: {
        collection: 'todos', 
        values: {
          _id: ['ObjectId', 'rud'],
          title: ['String', 'cru'],
          completed: ['Boolean', 'cru', false],
          userId: ['ObjectId', 'cru'],
          created_at: ['Date', 'cr', Date.now]
        }
      }
    },

    // Database configuration - using in-memory for easy testing
    db: '@memory/db',

    // Enable authentication
    auth: {
      enabled: true
    },

    // Basic middleware setup
    middlewares: {
      cors: true,
      limit: '10mb'
    },

    // Required providers
    providers: {
      '@memory/db': {}
    },

    // Empty routes - we'll use Express instead!
    routes: () => ({
      // No DSL routes needed - we'll use Express patterns
    })
  }
}