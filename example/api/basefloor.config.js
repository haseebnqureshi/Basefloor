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
    }
  };
} 