/**
 * Real MinIO File Upload Test
 * Tests actual file upload to MinIO storage
 */
require('dotenv').config();
const api = require('../../packages/api');
const fs = require('fs');
const FormData = require('form-data');

const API = api({
  projectPath: __dirname,
  envPath: './.env.files'
});

API.Init();

// Health check
API.get('/', (req, res) => {
  res.json({ 
    message: 'MinIO File Upload Test',
    minio_running: true,
    endpoints: [
      'POST /test-upload - Test file upload without auth',
      'GET /test-connection - Test MinIO connection'
    ]
  });
});

// Test MinIO connection directly
API.get('/test-connection', async (req, res) => {
  try {
    console.log('🔗 Testing MinIO connection directly...');
    
    if (!API.Files || !API.Files.Provider) {
      return res.status(500).json({
        error: 'Files provider not available',
        available: Object.keys(API.Files || {})
      });
    }
    
    // Test the MinIO connection
    const result = await API.Files.Provider.test();
    
    res.json({
      success: true,
      message: 'MinIO connection successful',
      result: result
    });
  } catch (error) {
    console.error('🔗 MinIO connection error:', error);
    res.status(500).json({
      error: error.message,
      details: 'Check MinIO server and credentials'
    });
  }
});

// Simple file upload test (without authentication for easier testing)
API.post('/test-upload', async (req, res) => {
  try {
    console.log('📤 Testing file upload to MinIO...');
    console.log('Headers:', req.headers);
    
    if (!API.Files) {
      return res.status(500).json({
        error: 'Files service not available'
      });
    }
    
    // For this test, let's try to use the Files service directly
    console.log('📁 Available Files methods:', Object.keys(API.Files));
    
    // Create a simple test file upload
    const testContent = 'Hello MinIO from BasefloorAPI!';
    const testBuffer = Buffer.from(testContent);
    
    // Try to use the Files upload method if available
    if (API.Files.upload) {
      const uploadResult = await API.Files.upload(req, {
        buffer: testBuffer,
        filename: 'test-minio-upload.txt',
        mimetype: 'text/plain'
      });
      
      res.json({
        success: true,
        message: 'File uploaded to MinIO successfully',
        result: uploadResult
      });
    } else {
      res.json({
        message: 'Files service available but upload method not found',
        available_methods: Object.keys(API.Files),
        provider: API.Files.Provider ? 'Provider loaded' : 'No provider'
      });
    }
  } catch (error) {
    console.error('📤 Upload test error:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

API.Start();

console.log('🧪 MinIO Upload Test API running on port 4000');
console.log('📍 Test Endpoints:');
console.log('   GET / - Health check');
console.log('   GET /test-connection - Test MinIO connection');
console.log('   POST /test-upload - Test file upload to MinIO');
console.log('');
console.log('🗂️ MinIO running at: http://localhost:9000');
console.log('🖥️ MinIO Console: http://localhost:9001 (user: miniouser, pass: miniopassword)');