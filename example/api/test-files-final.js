/**
 * BasefloorAPI Files Final Test
 * Test the built-in file routes with properly configured providers
 */
require('dotenv').config();
const api = require('../../packages/api');

console.log('🧪 Testing BasefloorAPI Files with Properly Configured Providers');

const API = api({
  projectPath: __dirname,
  envPath: './.env',
});

console.log('Initializing API...');

try {
    API.Init();
    console.log('✅ API.Init() completed successfully');
    
    console.log('\nFiles service status:');
    console.log('- API.Files exists:', !!API.Files);
    console.log('- API.Files.enabled:', API.Files?.enabled);
    console.log('- API.Files methods count:', API.Files ? Object.keys(API.Files).length : 0);
    console.log('- API.Files.Remote exists:', !!(API.Files && API.Files.Remote));
    console.log('- API.Files.Sharp exists:', !!(API.Files && API.Files.Sharp));
    console.log('- API.Files.Libreoffice exists:', !!(API.Files && API.Files.Libreoffice));
    
    if (API.Files && Object.keys(API.Files).length > 0) {
        console.log('- API.Files methods:', Object.keys(API.Files).slice(0, 10));
    }
    
    // Check available routes
    console.log('\nAvailable routes:');
    let fileRoutes = [];
    API._router.stack.forEach((layer, index) => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
            const path = layer.route.path;
            console.log(`${index + 1}. ${methods} ${path}`);
            if (path.includes('/files')) {
                fileRoutes.push(`${methods} ${path}`);
            }
        }
    });
    
    console.log(`\n📊 File routes found: ${fileRoutes.length}`);
    if (fileRoutes.length > 0) {
        console.log('File routes:');
        fileRoutes.forEach(route => console.log(`  - ${route}`));
    }
    
    // Test server
    API.get('/status', (req, res) => {
        res.json({ 
            status: 'working',
            files_service_available: !!API.Files,
            files_method_count: API.Files ? Object.keys(API.Files).length : 0,
            providers_loaded: {
                Remote: !!(API.Files && API.Files.Remote),
                Sharp: !!(API.Files && API.Files.Sharp),
                Libreoffice: !!(API.Files && API.Files.Libreoffice)
            },
            file_routes_available: fileRoutes.length
        });
    });

    API.listen(4003, () => {
        console.log('\n🚀 Final test server running on http://localhost:4003');
        console.log('Status: curl http://localhost:4003/status');
        if (fileRoutes.length > 0) {
            console.log('Files: curl http://localhost:4003/files (requires auth)');
        }
    });
    
} catch (err) {
    console.error('🚨 API initialization failed:', err.message);
    console.error('Stack trace:', err.stack);
}