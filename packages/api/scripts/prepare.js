const { execSync } = require('child_process');
const path = require('path');

// Check if we're publishing
const isPublishing = process.env.npm_command === 'publish'

if (!isPublishing) {
  console.log('Running build as part of prepare script...');
  execSync('node scripts/build-providers.js', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
} else {
  console.log('Skipping prepare script during publish');
} 