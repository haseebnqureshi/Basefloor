/**
 * Basefloor - Full-stack framework with Node.js API and Vue/Nuxt components
 */

// Export the API
const api = require('./api');

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