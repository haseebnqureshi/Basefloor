require('dotenv').config();
const api = require('../../packages/api');

console.log('🧪 Testing Files Route Access');

const API = api({
  projectPath: __dirname,
  envPath: './.env',
});

API.Init();

// Check if routes were registered
console.log('Available routes:');
API._router.stack.forEach((layer, index) => {
    if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        console.log(`${index + 1}. ${methods} ${layer.route.path}`);
    }
});

console.log('\nFiles service state:');
console.log('- API.Files exists:', !!API.Files);
console.log('- API.Files methods:', API.Files ? Object.keys(API.Files) : 'none');
console.log('- API.Files.Provider exists:', !!(API.Files && API.Files.Provider));
console.log('- API.Files.Remote exists:', !!(API.Files && API.Files.Remote));

// Test minimal server
API.get('/test', (req, res) => {
    res.json({ test: 'working' });
});

API.listen(4001, () => {
    console.log('\n🚀 Test server running on http://localhost:4001');
    console.log('Try: curl http://localhost:4001/test');
    console.log('Try: curl http://localhost:4001/files');
});