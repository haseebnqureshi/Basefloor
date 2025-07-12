/**
 * BasefloorAPI Files Routes Testing
 * Test the built-in file routes with MinIO storage
 */
require('dotenv').config();
const api = require('../../packages/api');

console.log('🧪 Testing BasefloorAPI Built-in Files Routes');

const API = api({
  projectPath: __dirname,
  envPath: './.env',
  configPath: './basefloor.files-routes.config.js'
});

// Initialize API with Files service
API.Init();

// Health check with Files service status
API.get('/', (req, res) => {
  res.json({
    message: 'BasefloorAPI Files Routes Test',
    files_enabled: !!API.Files,
    files_methods: API.Files ? Object.keys(API.Files).slice(0, 10) : [],
    endpoints: [
      'POST /register - Register user',
      'POST /login - Login user',
      'GET /files - List user files (built-in)',
      'POST /files - Upload file (built-in)',
      'GET /files/:id - Get file info (built-in)',
      'GET /files/:id/download - Download file (built-in)',
      'DELETE /files/:id - Delete file (built-in)'
    ],
    note: 'These are the actual BasefloorAPI file routes!'
  });
});

// Test endpoint to show Files service status
API.get('/files-status', (req, res) => {
  res.json({
    files_service_available: !!API.Files,
    files_methods: API.Files ? Object.keys(API.Files) : [],
    provider_loaded: !!(API.Files && API.Files.Provider),
    provider_methods: API.Files && API.Files.Provider ? Object.keys(API.Files.Provider) : []
  });
});

API.Start();

console.log('🧪 Files Routes Test API running on port 4000');
console.log('📍 Built-in Files Routes (require authentication):');
console.log('   GET /files - List user files');
console.log('   POST /files - Upload file (with proper headers)');
console.log('   GET /files/:id - Get file metadata');
console.log('   GET /files/:id/download - Download file');
console.log('   PUT /files/:id - Update file metadata');
console.log('   DELETE /files/:id - Delete file');
console.log('   POST /files/:id/convert - Convert file format');
console.log('   GET /convert/:ext - Check conversion support');
console.log('');
console.log('📍 Auth & Status Routes:');
console.log('   POST /register - Register user');
console.log('   POST /login - Login user');
console.log('   GET / - API status');
console.log('   GET /files-status - Files service status');
console.log('');
console.log('🗂️ MinIO Console: http://localhost:9001');
console.log('   Username: miniouser');
console.log('   Password: miniopassword');
console.log('');
console.log('🎯 Testing REAL BasefloorAPI Files routes!');