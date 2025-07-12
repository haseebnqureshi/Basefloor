/**
 * Example Basefloor application
 * This demonstrates using BasefloorAPI with unified configuration
 */

const BasefloorAPI = require('./packages/api')

// Load the unified configuration and adapt it for the API module
const api = BasefloorAPI({
  projectPath: __dirname,
  envPath: './.env'
})

console.log('🚀 Basefloor application started!')
console.log('📖 Documentation: http://localhost:5173/')
console.log('🔧 API: http://localhost:3000/')

// We're not directly requiring the app components here as they should be imported
// via the Nuxt module system, but we provide a reference to the path

module.exports = {
  // Export the API functionality
  ...api,
  
  // Reference to the API module
  api,
  
  // Method to get the path to the app components
  // This will be used by the Nuxt module
  getAppPath: () => require.resolve('./app'),
  
  // Version info
  version: require('./package.json').version
}; 