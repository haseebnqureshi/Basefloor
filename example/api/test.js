/**
 * Basefloor Test API - Using in-memory database
 */
require('dotenv').config();

// Import the Basefloor API
const BasefloorAPI = require('../../packages/api');

// Temporarily backup the original config and use test config
const fs = require('fs');
const originalConfig = fs.readFileSync(__dirname + '/basefloor.config.js', 'utf8');
fs.writeFileSync(__dirname + '/basefloor.config.js.backup', originalConfig);
fs.copyFileSync(__dirname + '/basefloor.test.config.js', __dirname + '/basefloor.config.js');

// Initialize the API with test configuration
const API = BasefloorAPI({
  projectPath: __dirname,
  envPath: './.env'
});

// Restore original config on exit
process.on('exit', () => {
  fs.writeFileSync(__dirname + '/basefloor.config.js', originalConfig);
});

process.on('SIGINT', () => {
  fs.writeFileSync(__dirname + '/basefloor.config.js', originalConfig);
  process.exit(0);
});

// Initialize all components based on config
API.Init();

// Test route to check if auth is working
API.get('/test-auth', async (req, res) => {
  res.json({ message: 'Test API working!', timestamp: new Date().toISOString() });
});

// Start the server
API.Start();

console.log('🧪 Test API running on port 4001 with in-memory database');
console.log('📍 Endpoints:');
console.log('   POST /register - Register new user');
console.log('   POST /login - Login user');
console.log('   GET /user - Get current user (requires auth)');
console.log('   GET /test-auth - Test auth middleware');
console.log('   GET / - Health check');