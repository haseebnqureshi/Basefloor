/**
 * Raw MinIO Testing - Direct MinIO client usage
 * Test actual file storage without BasefloorAPI provider system
 */
require('dotenv').config();
const api = require('../../packages/api');

console.log('🧪 Raw MinIO Testing - Using MinIO client directly');

const API = api({
  projectPath: __dirname,
  envPath: './.env'
});

// Initialize API without Files service
API.Init();

// Test raw MinIO connection and upload
API.get('/test-raw-minio', async (req, res) => {
  try {
    console.log('🔗 Testing raw MinIO connection...');
    
    // Import MinIO directly
    const Minio = require('/Users/haseebqureshi/Code/minapi.dev/basefloor/node_modules/minio');
    
    // Create MinIO client
    const minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'miniouser',
      secretKey: process.env.MINIO_SECRET_KEY || 'miniopassword'
    });
    
    console.log('✅ MinIO client created');
    
    // Test bucket existence/creation
    const bucketName = process.env.MINIO_BUCKET || 'basefloor-test';
    const bucketExists = await minioClient.bucketExists(bucketName);
    
    if (!bucketExists) {
      console.log('🪣 Creating bucket:', bucketName);
      await minioClient.makeBucket(bucketName, 'us-east-1');
    }
    
    console.log('✅ Bucket ready:', bucketName);
    
    res.json({
      success: true,
      message: 'Raw MinIO connection successful!',
      bucket: bucketName,
      bucket_existed: bucketExists,
      client_config: {
        endPoint: process.env.MINIO_ENDPOINT || 'localhost',
        port: parseInt(process.env.MINIO_PORT) || 9000,
        useSSL: process.env.MINIO_USE_SSL === 'true'
      }
    });
  } catch (error) {
    console.error('❌ Raw MinIO test error:', error);
    res.status(500).json({
      error: error.message,
      type: error.constructor.name,
      code: error.code
    });
  }
});

// Test actual file upload with raw MinIO
API.post('/test-raw-upload', async (req, res) => {
  try {
    console.log('📤 Testing raw MinIO file upload...');
    
    // Import MinIO directly
    const Minio = require('/Users/haseebqureshi/Code/minapi.dev/basefloor/node_modules/minio');
    
    // Create MinIO client
    const minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'miniouser',
      secretKey: process.env.MINIO_SECRET_KEY || 'miniopassword'
    });
    
    // Create test file content
    const testContent = `🚀 REAL FILE UPLOAD TO MINIO SUCCESS! 🚀
    
Uploaded via: BasefloorAPI Raw MinIO Test
Timestamp: ${new Date().toISOString()}
File size: ${Buffer.byteLength('test content')} bytes
MinIO Endpoint: ${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}
Bucket: ${process.env.MINIO_BUCKET || 'basefloor-test'}

This proves that BasefloorAPI can successfully store files in MinIO!`;
    
    const fileName = `basefloor-test-${Date.now()}.txt`;
    const bucketName = process.env.MINIO_BUCKET || 'basefloor-test';
    
    console.log('📤 Uploading file:', fileName);
    console.log('📤 To bucket:', bucketName);
    console.log('📤 Content length:', testContent.length);
    
    // Upload file to MinIO
    const etag = await minioClient.putObject(
      bucketName,
      fileName,
      testContent,
      testContent.length,
      {
        'Content-Type': 'text/plain',
        'X-Upload-Source': 'BasefloorAPI-Raw-Test',
        'X-Test-Success': 'true'
      }
    );
    
    console.log('✅ Upload successful! ETag:', etag);
    
    // Get file info
    const fileInfo = await minioClient.statObject(bucketName, fileName);
    console.log('📋 File info:', fileInfo);
    
    // Generate download URL (presigned)
    const downloadUrl = await minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60);
    console.log('🔗 Download URL generated');
    
    res.json({
      success: true,
      message: '🎉 REAL FILE UPLOAD TO MINIO SUCCESSFUL! 🎉',
      file: {
        name: fileName,
        bucket: bucketName,
        size: testContent.length,
        etag: etag,
        content_type: 'text/plain',
        upload_time: new Date().toISOString(),
        download_url: downloadUrl,
        file_info: fileInfo
      },
      proof: 'This file is actually stored in MinIO storage!'
    });
  } catch (error) {
    console.error('❌ Raw upload error:', error);
    res.status(500).json({
      error: error.message,
      type: error.constructor.name,
      code: error.code
    });
  }
});

// Test file download
API.get('/test-raw-download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    console.log('📥 Testing raw file download:', filename);
    
    // Import MinIO directly
    const Minio = require('/Users/haseebqureshi/Code/minapi.dev/basefloor/node_modules/minio');
    
    // Create MinIO client
    const minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'miniouser',
      secretKey: process.env.MINIO_SECRET_KEY || 'miniopassword'
    });
    
    const bucketName = process.env.MINIO_BUCKET || 'basefloor-test';
    
    // Get file stream from MinIO
    const fileStream = await minioClient.getObject(bucketName, filename);
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    fileStream.pipe(res);
    console.log('✅ File download started');
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
    message: '🧪 Raw MinIO Testing API - REAL FILE STORAGE TEST',
    description: 'This API tests actual file storage operations with MinIO',
    endpoints: [
      'GET /test-raw-minio - Test MinIO connection and bucket setup',
      'POST /test-raw-upload - Upload real file to MinIO storage',
      'GET /test-raw-download/:filename - Download file from MinIO storage'
    ],
    minio_config: {
      endpoint: `${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}`,
      bucket: process.env.MINIO_BUCKET || 'basefloor-test',
      console_url: 'http://localhost:9001'
    }
  });
});

API.Start();

console.log('🧪 Raw MinIO Test API running on port 4000');
console.log('📍 Real File Storage Test Endpoints:');
console.log('   GET / - API info');
console.log('   GET /test-raw-minio - Test MinIO connection');
console.log('   POST /test-raw-upload - UPLOAD REAL FILE TO MINIO');
console.log('   GET /test-raw-download/:filename - DOWNLOAD REAL FILE FROM MINIO');
console.log('');
console.log('🗂️ MinIO Console: http://localhost:9001');
console.log('   Username: miniouser');
console.log('   Password: miniopassword');
console.log('');
console.log('🎯 This will test ACTUAL file storage operations!');