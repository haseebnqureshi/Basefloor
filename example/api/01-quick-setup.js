/**
 * Feature 1: Quick Setup
 * Minimal API setup with just a few lines of code
 */
require('dotenv').config();
const api = require('../../packages/api');

// Initialize API with minimal config
const API = api({
  projectPath: __dirname,
  envPath: './.env'
});

// Basic hello world route
API.get('/hello', (req, res) => {
  res.json({ 
    message: 'Hello from Basefloor!', 
    timestamp: new Date(),
    features: ['Quick Setup Working!']
  });
});

// Health check endpoint
API.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    api: 'Basefloor Quick Setup Example',
    uptime: process.uptime()
  });
});

// Initialize and start
API.Init();
API.Start();

console.log('🚀 Quick Setup Example API running!');
console.log('Try: GET /hello');
console.log('Try: GET /health'); 