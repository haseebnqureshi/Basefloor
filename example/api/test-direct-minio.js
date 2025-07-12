/**
 * Direct MinIO Testing - Bypass BasefloorAPI Files service complexity
 * Test actual file storage to MinIO directly
 */
require('dotenv').config();
const api = require('../../packages/api');
const path = require('path');

console.log('🧪 Direct MinIO Testing - Bypassing Files service complexity');

const API = api({
  projectPath: __dirname,
  envPath: './.env'
});

// Initialize API without Files service
API.Init();

// Test MinIO connection directly using the provider
API.get('/test-minio-direct', async (req, res) => {
  try {
    console.log('🔗 Testing direct MinIO connection...');
    
    // Load MinIO provider directly
    const loadProvider = require('../../packages/api/providers/loader');
    const minioProvider = loadProvider('../../packages/api/providers/@minio/files')({
      providerVars: {
        endPoint: process.env.MINIO_ENDPOINT || 'localhost',
        port: parseInt(process.env.MINIO_PORT) || 9000,
        useSSL: process.env.MINIO_USE_SSL === 'true',
        access: process.env.MINIO_ACCESS_KEY || 'miniouser',
        secret: process.env.MINIO_SECRET_KEY || 'miniopassword',
        bucket: process.env.MINIO_BUCKET || 'basefloor-test',
        region: 'us-east-1'
      },
      providerName: '@minio/files'
    });
    
    console.log('🔧 MinIO provider loaded:', !!minioProvider);
    console.log('🔧 Provider methods:', Object.keys(minioProvider));
    
    // Test connection
    const testResult = await minioProvider.test();
    console.log('✅ MinIO connection test result:', testResult);
    
    res.json({
      success: true,
      message: 'Direct MinIO connection successful!',
      provider_loaded: true,
      test_result: testResult,
      available_methods: Object.keys(minioProvider)
    });
  } catch (error) {
    console.error('❌ Direct MinIO test error:', error);
    res.status(500).json({
      error: error.message,
      type: error.constructor.name,
      stack: error.stack
    });
  }
});

// Test actual file upload to MinIO
API.post('/test-upload-direct', async (req, res) => {
  try {
    console.log('📤 Testing direct file upload to MinIO...');
    
    // Load MinIO provider
    const loadProvider = require('../../packages/api/providers/loader');
    const minioProvider = loadProvider('../../packages/api/providers/@minio/files')({
      providerVars: {
        endPoint: process.env.MINIO_ENDPOINT || 'localhost',
        port: parseInt(process.env.MINIO_PORT) || 9000,
        useSSL: process.env.MINIO_USE_SSL === 'true',
        access: process.env.MINIO_ACCESS_KEY || 'miniouser',
        secret: process.env.MINIO_SECRET_KEY || 'miniopassword',
        bucket: process.env.MINIO_BUCKET || 'basefloor-test',
        region: 'us-east-1'
      },
      providerName: '@minio/files'
    });
    
    // Create test file content
    const testContent = `Hello MinIO from BasefloorAPI Direct Test!
Timestamp: ${new Date().toISOString()}
This file was uploaded directly to MinIO storage.`;
    
    const testBuffer = Buffer.from(testContent);
    const fileName = `test-upload-${Date.now()}.txt`;
    
    console.log('📤 Uploading test file:', fileName);
    console.log('📤 File size:', testBuffer.length, 'bytes');
    
    // Upload to MinIO
    const uploadResult = await minioProvider.run().putObject(
      process.env.MINIO_BUCKET || 'basefloor-test',
      fileName,
      testBuffer,
      testBuffer.length,
      {
        'Content-Type': 'text/plain',
        'X-Upload-Source': 'BasefloorAPI-Direct-Test'
      }
    );
    
    console.log('✅ Upload successful:', uploadResult);
    
    // Generate download URL
    const downloadUrl = await minioProvider.run().presignedGetObject(
      process.env.MINIO_BUCKET || 'basefloor-test',
      fileName,
      24 * 60 * 60 // 24 hours
    );
    
    res.json({
      success: true,
      message: 'File uploaded to MinIO successfully!',
      file: {
        name: fileName,
        size: testBuffer.length,
        content_type: 'text/plain',
        upload_result: uploadResult,
        download_url: downloadUrl,
        bucket: process.env.MINIO_BUCKET || 'basefloor-test'
      }
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      error: error.message,
      type: error.constructor.name
    });
  }
});

// Test file download from MinIO
API.get('/test-download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    console.log('📥 Testing file download from MinIO:', filename);
    
    // Load MinIO provider
    const loadProvider = require('../../packages/api/providers/loader');
    const minioProvider = loadProvider('../../packages/api/providers/@minio/files')({
      providerVars: {
        endPoint: process.env.MINIO_ENDPOINT || 'localhost',
        port: parseInt(process.env.MINIO_PORT) || 9000,
        useSSL: process.env.MINIO_USE_SSL === 'true',
        access: process.env.MINIO_ACCESS_KEY || 'miniouser',
        secret: process.env.MINIO_SECRET_KEY || 'miniopassword',
        bucket: process.env.MINIO_BUCKET || 'basefloor-test',
        region: 'us-east-1'
      },
      providerName: '@minio/files'
    });
    
    // Get file from MinIO
    const fileStream = await minioProvider.run().getObject(
      process.env.MINIO_BUCKET || 'basefloor-test',
      filename
    );
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    fileStream.pipe(res);
    console.log('✅ File download streaming started');
  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({
      error: error.message,
      type: error.constructor.name
    });
  }
});

API.get('/', (req, res) => {
  res.json({
    message: 'Direct MinIO Testing API',
    endpoints: [
      'GET /test-minio-direct - Test MinIO connection',
      'POST /test-upload-direct - Upload test file to MinIO',
      'GET /test-download/:filename - Download file from MinIO'
    ],
    minio_config: {
      endpoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: process.env.MINIO_PORT || 9000,
      bucket: process.env.MINIO_BUCKET || 'basefloor-test'
    }
  });
});

API.Start();

console.log('🧪 Direct MinIO Test API running on port 4000');
console.log('📍 Endpoints:');
console.log('   GET / - API info');
console.log('   GET /test-minio-direct - Test MinIO connection');
console.log('   POST /test-upload-direct - Upload file to MinIO');
console.log('   GET /test-download/:filename - Download file from MinIO');
console.log('');
console.log('🗂️ MinIO Console: http://localhost:9001');
console.log('   Username: miniouser');
console.log('   Password: miniopassword');