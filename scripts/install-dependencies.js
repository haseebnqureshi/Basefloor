const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function getProjectRoot() {
  let currentDir = __dirname;
  
  while (currentDir !== '/') {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  throw new Error('Could not find project root');
}

function detectPackageManager() {
  const projectRoot = getProjectRoot();
  return fs.existsSync(path.join(projectRoot, 'yarn.lock')) ? 'yarn' : 'npm';
}

function installCoreDependencies() {
  const packageManager = detectPackageManager();
  const miniApiDir = path.join(__dirname, '..');
  
  // Check if we're in development mode (running from minapi project directly)
  const isDevelopment = fs.existsSync(path.join(miniApiDir, '.git'));
  if (isDevelopment) {
    console.log('Development mode detected, skipping core dependency installation');
    return;
  }

  console.log('Installing MinAPI core dependencies...');
  
  try {
    // Create node_modules directory if it doesn't exist
    const nodeModulesPath = path.join(miniApiDir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      fs.mkdirSync(nodeModulesPath, { recursive: true });
    }

    // Install dependencies and allow installation scripts to run
    execSync(`${packageManager} install`, {
      stdio: 'inherit',
      cwd: miniApiDir,
      env: { ...process.env, SKIP_POSTINSTALL: 'true' } // Prevent recursive postinstall
    });
    
    console.log('Core dependencies installed successfully');
  } catch (err) {
    console.error('Failed to install core dependencies:', err);
    throw err;
  }
}

installCoreDependencies(); 