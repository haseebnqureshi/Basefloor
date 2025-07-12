/**
 * Real BasefloorAPI Files Service Test
 * Tests actual Files service with MinIO provider
 */
require('dotenv').config({ path: './.env.files' });
const api = require('../../packages/api');

console.log('🔧 Starting BasefloorAPI with real Files service...');
console.log('Environment:', {
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
  MINIO_PORT: process.env.MINIO_PORT,
  MINIO_BUCKET: process.env.MINIO_BUCKET
});

const API = api({
  projectPath: __dirname,
  envPath: './.env.files',
  configPath: './basefloor.files-test.config.js'
});

// Initialize API
console.log('🚀 Initializing BasefloorAPI...');
API.Init();

// Health check
API.get('/', (req, res) => {
  res.json({ 
    message: 'BasefloorAPI Files Test', 
    files_enabled: !!API.Files,
    files_provider: API.Files ? 'Available' : 'Not Available',
    endpoints: [
      'POST /register',
      'POST /login', 
      'GET /user',
      'Built-in Files endpoints (if provider connected)'
    ]
  });
});

// Test Files service availability
API.get('/files/test', (req, res) => {
  try {
    console.log('📁 Testing Files service availability...');
    
    if (!API.Files) {
      return res.status(500).json({
        error: 'Files service not available',
        message: 'API.Files is not initialized. Check Files provider configuration.'
      });
    }
    
    res.json({
      success: true,
      message: 'Files service is available',
      methods: Object.keys(API.Files),
      provider: 'MinIO (@minio/files)'
    });
  } catch (error) {
    console.error('📁 Files test error:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Test MinIO connection
API.get('/files/connection-test', [API.requireAuthentication], async (req, res) => {
  try {
    console.log('🔗 Testing MinIO connection...');
    
    if (!API.Files) {
      return res.status(500).json({
        error: 'Files service not available'
      });
    }
    
    // Try to test the connection (this will fail without MinIO running)
    const testResult = await API.Files.test();
    
    res.json({
      success: true,
      message: 'MinIO connection successful',
      result: testResult
    });
  } catch (error) {
    console.error('🔗 MinIO connection error:', error);
    res.status(500).json({
      error: error.message,
      details: 'MinIO server may not be running or configuration is incorrect',
      solution: 'Start MinIO with: docker run -p 9000:9000 -p 9001:9001 --name minio-test -e "MINIO_ROOT_USER=miniouser" -e "MINIO_ROOT_PASSWORD=miniopassword" minio/minio server /data --console-address ":9001"'
    });
  }
});

// Custom file upload test (to see the real API structure)
API.post('/test-upload', [API.requireAuthentication], async (req, res) => {
  try {
    console.log('📤 Testing file upload structure...');
    
    if (!API.Files) {
      return res.status(500).json({
        error: 'Files service not available'
      });
    }
    
    // This will show us what methods are available on API.Files
    const methods = Object.keys(API.Files);
    console.log('📁 Available Files methods:', methods);
    
    res.json({
      success: true,
      message: 'Files service structure',
      available_methods: methods,
      note: 'Use built-in Files endpoints for actual uploads'
    });
  } catch (error) {
    console.error('📤 Upload test error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

API.Start();

console.log('🧪 Real Files API Test running on port 4000');
console.log('📍 Test Endpoints:');
console.log('   GET / - Health check and Files service status');
console.log('   GET /files/test - Test Files service availability');
console.log('   GET /files/connection-test - Test MinIO connection (requires auth)');
console.log('   POST /test-upload - Test upload structure (requires auth)');
console.log('');
console.log('📁 Built-in Files Endpoints (if provider works):');
console.log('   POST /files - Upload file');
console.log('   GET /files - List files');
console.log('   GET /files/:id - Get file info');
console.log('   GET /files/:id/download - Download file');
console.log('   DELETE /files/:id - Delete file');
console.log('');
console.log('💡 To test with real MinIO, run:');
console.log('   docker run -p 9000:9000 -p 9001:9001 --name minio-test \\');
console.log('     -e "MINIO_ROOT_USER=miniouser" -e "MINIO_ROOT_PASSWORD=miniopassword" \\');
console.log('     minio/minio server /data --console-address ":9001"');