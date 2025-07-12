/**
 * Basefloor Test API - Using in-memory database
 */
require('dotenv').config();

// Import the Basefloor API
const BasefloorAPI = require('../../../packages/api');

// Initialize the API with test configuration
const API = BasefloorAPI({
  projectPath: __dirname,
  envPath: './.env'
});

// Test route to check API is working
API.get('/test', async (req, res) => {
  res.json({ message: 'Test API working!', timestamp: new Date().toISOString() });
});

// Initialize all components based on config
API.Init();

// Start the server
API.Start();

console.log('🧪 Test API running on port 4001 with in-memory database');
console.log('📍 Endpoints:');
console.log('   POST /register - Register new user');
console.log('   POST /login - Login user');
console.log('   GET /user - Get current user (requires auth)');
console.log('   GET /test - Test endpoint');
console.log('   GET / - Health check');