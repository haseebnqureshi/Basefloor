const fs = require('fs');
const path = require('path');

function detectPackageManager() {
  const projectRoot = path.join(__dirname, '..');
  const hasYarnLock = fs.existsSync(path.join(projectRoot, 'yarn.lock'));
  const hasNpmLock = fs.existsSync(path.join(projectRoot, 'package-lock.json'));
  
  if (hasYarnLock) return 'yarn';
  if (hasNpmLock) return 'npm';
  
  return 'npm';
}

function getInstallCommand(dependencies) {
  const packageManager = detectPackageManager();
  const deps = dependencies.join(' ');
  
  switch (packageManager) {
    case 'yarn':
      return `yarn add --save ${deps}`;
    case 'npm':
    default:
      return `npm install ${deps} --save`;
  }
}

function checkProviderDependencies(providerPath) {
  // Load the manifest
  const manifestPath = path.join(__dirname, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Load MinAPI's package.json
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Get all installed dependencies
  const installedDeps = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {})
  ]);
  
  // Get provider name from path (e.g., "@anthropic/ai")
  const relativePath = path.relative(__dirname, providerPath);
  const providerName = relativePath.replace('.js', '');
  
  // Get required dependencies for this provider
  const requiredDeps = manifest[providerName];
  if (!requiredDeps) {
    throw new Error(`Provider ${providerName} not found in manifest`);
  }
  
  // Check if dependencies are installed in MinAPI's package.json
  const missingDeps = requiredDeps.filter(dep => !installedDeps.has(dep));
  
  if (missingDeps.length > 0) {
    const installCommand = getInstallCommand(missingDeps);
    throw new Error(
      `Missing required dependencies for ${providerName}:\n` +
      `Please run '${installCommand}' in the MinAPI directory to install the missing dependencies.`
    );
  }
  
  // Now try to require them to ensure they're actually available
  try {
    requiredDeps.forEach(dep => require(dep));
  } catch (err) {
    const installCommand = getInstallCommand(requiredDeps);
    throw new Error(
      `Failed to load dependency for ${providerName}: ${err.message}\n` +
      `Try running '${installCommand}' in the MinAPI directory`
    );
  }
}

function loadProvider(providerPath) {
  checkProviderDependencies(providerPath);
  return require(providerPath);
}

module.exports = loadProvider; 