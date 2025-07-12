/**
 * BasefloorAPI Files Complete Testing
 * Test the built-in file routes with all required providers
 */
require('dotenv').config();
const api = require('../../packages/api');

console.log('🧪 Testing BasefloorAPI Files with Complete Provider Setup');

const API = api({
  projectPath: __dirname,
  envPath: './.env',
});

// Load the complete configuration
const config = require('./basefloor.files-complete.config.js')(API);
console.log('Config loaded:');
console.log('- files.enabled:', config.files.enabled);
console.log('- files.providers:', config.files.providers);
console.log('- providers configured:', Object.keys(config.providers));

// Override the config loading for this test
API.config = config;

console.log('\nInitializing API with complete provider setup...');

try {
    API.Init();
    console.log('✅ API.Init() completed successfully');
    
    console.log('\nFiles service status:');
    console.log('- API.Files exists:', !!API.Files);
    console.log('- API.Files.enabled:', API.Files?.enabled);
    console.log('- API.Files methods:', API.Files ? Object.keys(API.Files).slice(0, 15) : 'none');
    console.log('- API.Files.Provider exists:', !!(API.Files && API.Files.Provider));
    console.log('- API.Files.Remote exists:', !!(API.Files && API.Files.Remote));
    console.log('- API.Files.Sharp exists:', !!(API.Files && API.Files.Sharp));
    console.log('- API.Files.Libreoffice exists:', !!(API.Files && API.Files.Libreoffice));
    
    // Check available routes
    console.log('\nAvailable routes:');
    let fileRoutes = 0;
    API._router.stack.forEach((layer, index) => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
            const path = layer.route.path;
            console.log(`${index + 1}. ${methods} ${path}`);
            if (path.includes('/files')) {
                fileRoutes++;
            }
        }
    });
    
    console.log(`\n📊 Found ${fileRoutes} file-related routes`);
    
    // Test minimal server
    API.get('/test', (req, res) => {
        res.json({ 
            test: 'working',
            files_service: !!API.Files,
            providers: {
                Remote: !!(API.Files && API.Files.Remote),
                Sharp: !!(API.Files && API.Files.Sharp),
                Libreoffice: !!(API.Files && API.Files.Libreoffice)
            }
        });
    });

    API.listen(4002, () => {
        console.log('\n🚀 Complete test server running on http://localhost:4002');
        console.log('Try: curl http://localhost:4002/test');
        console.log('Try: curl http://localhost:4002/files (should require auth)');
    });
    
} catch (err) {
    console.error('🚨 API initialization failed:', err.message);
    console.error('Stack trace:', err.stack);
}