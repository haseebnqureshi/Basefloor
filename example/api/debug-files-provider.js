const path = require('path');

// Test provider loading directly
const loadProvider = require('../../packages/api/providers/loader');

console.log('Testing MinIO provider loading...');

try {
    const providerPath = path.join(__dirname, '../../packages/api/providers/@minio/files.js');
    console.log('Provider path:', providerPath);
    
    const provider = loadProvider(providerPath);
    console.log('Provider loaded successfully');
    
    // Test initialization
    const minioProvider = provider({
        providerVars: {
            endPoint: 'localhost',
            port: 9000,
            useSSL: false,
            access: 'miniouser',
            secret: 'miniopassword',
            bucket: 'basefloor-test',
            region: 'us-east-1'
        },
        providerName: '@minio/files'
    });
    
    console.log('MinIO provider initialized');
    console.log('Provider methods:', Object.keys(minioProvider));
    
} catch (error) {
    console.error('Provider loading failed:', error.message);
    console.error('Stack:', error.stack);
}