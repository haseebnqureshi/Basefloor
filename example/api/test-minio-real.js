/**
 * Real MinIO Testing with BasefloorAPI Files
 * Based on 04-file-management.js but with MinIO configuration
 */
require('dotenv').config({ path: './.env.minio' });
const api = require('../../packages/api');

console.log('🔧 MinIO Configuration:');
console.log('MINIO_ENDPOINT:', process.env.MINIO_ENDPOINT);
console.log('MINIO_PORT:', process.env.MINIO_PORT);
console.log('MINIO_ACCESS_KEY:', process.env.MINIO_ACCESS_KEY);
console.log('MINIO_BUCKET:', process.env.MINIO_BUCKET);

const API = api({
  projectPath: __dirname,
  envPath: './.env.minio',
  configPath: './basefloor.minio.config.js'
});

// Initialize the API first to make middlewares available
API.Init();

console.log('📁 Files service after init:', !!API.Files);
console.log('📁 Files methods:', API.Files ? Object.keys(API.Files) : 'Not available');

// Health check with MinIO status
API.get('/', (req, res) => {
  res.json({
    message: 'MinIO Integration Test',
    files_available: !!API.Files,
    files_methods: API.Files ? Object.keys(API.Files) : [],
    minio_config: {
      endpoint: process.env.MINIO_ENDPOINT,
      port: process.env.MINIO_PORT,
      bucket: process.env.MINIO_BUCKET
    }
  });
});

// Test MinIO connection without auth
API.get('/minio-test', async (req, res) => {
  try {
    console.log('🔗 Testing MinIO connection...');
    
    if (!API.Files) {
      return res.status(500).json({
        error: 'Files service not initialized',
        message: 'API.Files is not available'
      });
    }
    
    if (!API.Files.Provider) {
      return res.status(500).json({
        error: 'MinIO provider not loaded',
        available_methods: Object.keys(API.Files)
      });
    }
    
    // Test MinIO connection
    const result = await API.Files.Provider.test();
    
    res.json({
      success: true,
      message: 'MinIO connection successful!',
      result: result
    });
  } catch (error) {
    console.error('🔗 MinIO test error:', error);
    res.status(500).json({
      error: error.message,
      type: error.constructor.name,
      code: error.code
    });
  }
});

// Simplified file upload that mimics the 04-file-management pattern
API.post('/files/upload', async (req, res) => {
  try {
    console.log('📤 File upload attempt...');
    
    if (!API.Files || !API.Files.upload) {
      return res.status(500).json({
        error: 'Files upload not available',
        available: API.Files ? Object.keys(API.Files) : 'Files service not loaded'
      });
    }
    
    // File upload handled by basefloor files middleware
    const uploadResult = await API.Files.upload(req, {
      folder: 'user-uploads',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/*', 'text/*', 'application/pdf']
    });
    
    console.log('📤 Upload result:', uploadResult);
    
    res.json({ 
      success: true, 
      message: 'File uploaded to MinIO successfully!',
      file: uploadResult
    });
  } catch (error) {
    console.error('📤 Upload error:', error);
    res.status(500).json({ 
      error: error.message,
      type: error.constructor.name
    });
  }
});

// Simple file list
API.get('/files', async (req, res) => {
  try {
    console.log('📁 Listing files...');
    
    if (!API.Files) {
      return res.status(500).json({ error: 'Files service not available' });
    }
    
    res.json({
      success: true,
      message: 'Files service is available',
      note: 'Real file listing would require database integration'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.Start();

console.log('🧪 Real MinIO Test API running on port 4000');
console.log('📍 Endpoints:');
console.log('   GET / - Health check with MinIO status');
console.log('   GET /minio-test - Test MinIO connection directly');
console.log('   POST /files/upload - Upload file to MinIO');
console.log('   GET /files - Test files listing');
console.log('');
console.log('🗂️ MinIO Server: http://localhost:9000');
console.log('🖥️ MinIO Console: http://localhost:9001');