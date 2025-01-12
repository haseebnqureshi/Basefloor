const fs = require('fs');
const path = require('path');

function checkProviderDependencies(providerPath) {
  // Load the manifest
  const manifestPath = path.join(__dirname, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Get provider name from path (e.g., "@anthropic/ai")
  const relativePath = path.relative(__dirname, providerPath);
  const providerName = relativePath.replace('.js', '');
  
  // Get required dependencies for this provider
  const requiredDeps = manifest[providerName];
  if (!requiredDeps) {
    throw new Error(`Provider ${providerName} not found in manifest`);
  }
  
  // Check if dependencies are installed
  const missingDeps = [];
  for (const dep of requiredDeps) {
    try {
      require(dep);
    } catch (err) {
      missingDeps.push(dep);
    }
  }
  
  if (missingDeps.length > 0) {
    throw new Error(
      `Missing required dependencies for ${providerName}:\n` +
      `Please install: npm install ${missingDeps.join(' ')}`
    );
  }
}

function loadProvider(providerPath) {
  checkProviderDependencies(providerPath);
  return require(providerPath);
}

module.exports = loadProvider; 