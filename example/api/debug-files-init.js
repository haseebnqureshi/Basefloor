require('dotenv').config();
const api = require('../../packages/api');

// Test API initialization with detailed logging
console.log('🧪 Debugging Files Service Initialization');

const API = api({
  projectPath: __dirname,
  envPath: './.env',
});

console.log('API instance created');

// Mock the config to test files service
const { project, files, providers } = require('./basefloor.files-routes.config.js')(API);

console.log('Config loaded:');
console.log('- files.enabled:', files.enabled);
console.log('- files.provider:', files.provider);
console.log('- providers:', Object.keys(providers));

// Test provider loading directly
console.log('\nTesting provider initialization...');

try {
    // This mimics what happens in packages/api/files/index.js
    const loadProvider = require('../../packages/api/providers/loader');
    
    console.log('Loading provider:', files.provider);
    const provider = loadProvider(`../../packages/api/providers/${files.provider}`);
    console.log('Provider loader returned:', typeof provider);
    
    const providerInstance = provider({ 
        providerVars: providers[files.provider],
        providerName: files.provider,
    });
    
    console.log('Provider instance created');
    console.log('Provider methods:', Object.keys(providerInstance));
    
} catch (err) {
    console.error('🚨 Provider loading failed:', err.message);
    console.error('Stack trace:', err.stack);
}

console.log('\nNow testing full API.Init()...');

try {
    API.Init();
    console.log('✅ API.Init() completed successfully');
    console.log('Files service status:');
    console.log('- API.Files exists:', !!API.Files);
    console.log('- API.Files.enabled:', API.Files?.enabled);
    console.log('- API.Files methods:', API.Files ? Object.keys(API.Files).slice(0, 10) : 'none');
    
} catch (err) {
    console.error('🚨 API.Init() failed:', err.message);
    console.error('Stack trace:', err.stack);
}