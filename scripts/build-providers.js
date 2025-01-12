const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Helper to get project root (parent of node_modules)
function getProjectRoot() {
  let currentDir = process.cwd();
  
  // Keep going up until we're out of node_modules
  while (currentDir.includes('node_modules')) {
    currentDir = path.dirname(currentDir);
  }
  
  return currentDir;
}

function getServiceTypes() {
  const providersDir = path.join(__dirname, '../providers');
  const services = {};

  // Scan @provider directories
  fs.readdirSync(providersDir).forEach(item => {
    const itemPath = path.join(providersDir, item);
    if (item.startsWith('@') && fs.statSync(itemPath).isDirectory()) {
      fs.readdirSync(itemPath).forEach(file => {
        if (file.endsWith('.js')) {
          const providerName = `${item}/${file.replace('.js', '')}`;
          const serviceType = file.replace('.js', '');
          
          // Initialize service type set if it doesn't exist
          if (!services[serviceType]) {
            services[serviceType] = new Set();
          }
          services[serviceType].add(providerName);
        }
      });
    }
  });

  return services;
}

function getEnabledProviders() {
  let config;
  try {
    config = require(path.join(getProjectRoot(), 'minapi.config.js'));
  } catch (err) {
    console.error('Could not load minapi.config.js');
    process.exit(1);
  }

  const enabled = new Set();
  const services = getServiceTypes();

  // Check each discovered service type
  Object.entries(services).forEach(([serviceType, providers]) => {
    if (config[serviceType]?.enabled) {
      if (config[serviceType].provider && providers.has(config[serviceType].provider)) {
        enabled.add(config[serviceType].provider);
      }
      if (config[serviceType].providers) {
        Object.values(config[serviceType].providers).forEach(provider => {
          if (providers.has(provider)) {
            enabled.add(provider);
          }
        });
      }
    }
  });

  return enabled;
}

function getDependenciesFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const requirePatterns = [
    /require\(['"]([@\w\/-]+)['"]\)/g,
    /(?:const|let|var)\s*{\s*[\w\s,]+}\s*=\s*require\(['"]([@\w\/-]+)['"]\)/g,
    /(?:const|let|var)\s+[\w\d_$]+\s*=\s*require\(['"]([@\w\/-]+)['"]\)/g
  ];
  
  const dependencies = new Set();
  
  requirePatterns.forEach(pattern => {
    const matches = [...content.matchAll(pattern)];
    matches
      .map(match => match[1])
      .filter(dep => {
        const isRelativePath = dep.startsWith('./') || dep.startsWith('../');
        const isNodeBuiltin = ['fs', 'path', 'crypto', 'util'].includes(dep);
        return !isRelativePath && !isNodeBuiltin;
      })
      .forEach(dep => dependencies.add(dep));
  });
  
  return Array.from(dependencies);
}

function scanProviders() {
  const providersDir = path.join(__dirname, '../providers');
  const providerDeps = {};
  const allDeps = new Set();
  const enabledProviders = getEnabledProviders();
  
  fs.readdirSync(providersDir).forEach(item => {
    const itemPath = path.join(providersDir, item);
    if (item.startsWith('@') && fs.statSync(itemPath).isDirectory()) {
      fs.readdirSync(itemPath).forEach(file => {
        if (file.endsWith('.js')) {
          const providerName = `${item}/${file.replace('.js', '')}`;
          if (enabledProviders.has(providerName)) {
            const filePath = path.join(itemPath, file);
            const deps = getDependenciesFromFile(filePath);
            providerDeps[providerName] = deps;
            deps.forEach(dep => allDeps.add(dep));
          }
        }
      });
    }
  });

  return { providerDeps, allDeps };
}

function installDependencies(dependencies) {
  const packageManager = detectPackageManager();
  const depsArray = Array.from(dependencies);
  
  if (depsArray.length === 0) return;
  
  console.log('Installing provider dependencies:', depsArray.join(', '));
  
  try {
    switch (packageManager) {
      case 'yarn':
        execSync(`yarn add ${depsArray.join(' ')} --ignore-scripts`, { stdio: 'inherit' });
        break;
      case 'npm':
      default:
        execSync(`npm install ${depsArray.join(' ')} --ignore-scripts`, { stdio: 'inherit' });
        break;
    }
  } catch (err) {
    console.error(`Failed to install dependencies using ${packageManager}:`, err);
    process.exit(1);
  }
}

function detectPackageManager() {
  const projectRoot = getProjectRoot();
  const hasYarnLock = fs.existsSync(path.join(projectRoot, 'yarn.lock'));
  const hasNpmLock = fs.existsSync(path.join(projectRoot, 'package-lock.json'));
  
  if (hasYarnLock) return 'yarn';
  if (hasNpmLock) return 'npm';
  
  return 'npm';
}

function updatePackageJson(dependencies) {
  const packageJsonPath = path.join(getProjectRoot(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.peerDependencies = packageJson.peerDependencies || {};
  
  dependencies.forEach(dep => {
    packageJson.peerDependencies[dep] = '*';
  });
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json with provider peer dependencies');
}

// Generate the manifest and update package.json
const { providerDeps, allDeps } = scanProviders();

// Save the manifest
const manifestPath = path.join(__dirname, '../providers/manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(providerDeps, null, 2));

// Update package.json with peer dependencies
updatePackageJson(allDeps);

// Install all dependencies found
if (allDeps.size > 0) {
  installDependencies(allDeps);
}

console.log('Provider manifest generated and dependencies installed'); 