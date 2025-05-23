const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function installCoreDependencies() {
  const miniApiDir = path.join(__dirname, '..');
  
  // Check if we're in development mode (running from minapi project directly)
  const isDevelopment = fs.existsSync(path.join(miniApiDir, '.git'));
  
  // If SKIP_POSTINSTALL is set, we're in a recursive install - skip
  if (process.env.SKIP_POSTINSTALL === 'true') {
    console.log('Skipping core dependency installation (SKIP_POSTINSTALL is set)');
    return;
  }
  
  console.log('Installing MinAPI core dependencies...');
  
  try {
    // Create node_modules directory if it doesn't exist
    const nodeModulesPath = path.join(miniApiDir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      fs.mkdirSync(nodeModulesPath, { recursive: true });
    }

    // Install dependencies
    const command = isDevelopment ? 'npm install' : 'npm install --production';
    execSync(command, {
      stdio: 'inherit',
      cwd: miniApiDir,
      env: { 
        ...process.env, 
        SKIP_POSTINSTALL: 'true',  // Prevent recursive postinstall
        NODE_ENV: isDevelopment ? 'development' : 'production'
      }
    });
    
    // Run build if not in development mode
    if (!isDevelopment) {
      execSync('npm run build', {
        stdio: 'inherit',
        cwd: miniApiDir,
        env: { ...process.env, SKIP_POSTINSTALL: 'true' }
      });
    }
    
    console.log('Core dependencies installed successfully');
  } catch (err) {
    console.error('Failed to install core dependencies:', err);
    process.exit(1);
  }
}

installCoreDependencies(); 