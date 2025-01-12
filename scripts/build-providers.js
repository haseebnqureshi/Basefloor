const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getProjectRoot() {
  let currentDir = process.cwd();
  
  while (currentDir.includes('node_modules')) {
    currentDir = path.dirname(currentDir);
  }
  
  return currentDir;
}

function isDevMode() {
  try {
    require(path.join(getProjectRoot(), 'minapi.config.js'));
    return false;
  } catch (err) {
    return true;
  }
}

function getPackageJsonPath() {
  return isDevMode() 
    ? path.join(__dirname, '../package.json')
    : path.join(getProjectRoot(), 'package.json');
}

function detectPackageManager() {
  const projectRoot = isDevMode() ? path.join(__dirname, '..') : getProjectRoot();
  const hasYarnLock = fs.existsSync(path.join(projectRoot, 'yarn.lock'));
  const hasNpmLock = fs.existsSync(path.join(projectRoot, 'package-lock.json'));
  
  if (hasYarnLock) return 'yarn';
  if (hasNpmLock) return 'npm';
  
  return 'npm';
}

function getServiceTypes() {
  const providersDir = path.join(__dirname, '../providers');
  const services = {};

  fs.readdirSync(providersDir).forEach(item => {
    const itemPath = path.join(providersDir, item);
    if (item.startsWith('@') && fs.statSync(itemPath).isDirectory()) {
      fs.readdirSync(itemPath).forEach(file => {
        if (file.endsWith('.js')) {
          const providerName = `${item}/${file.replace('.js', '')}`;
          const serviceType = file.replace('.js', '');
          
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
    console.log('No minapi.config.js found, loading all provider dependencies');
    const services = getServiceTypes();
    const allProviders = new Set();
    Object.values(services).forEach(providers => {
      providers.forEach(provider => allProviders.add(provider));
    });
    return allProviders;
  }

  const enabled = new Set();
  const services = getServiceTypes();

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

function updatePackageJson(dependencies) {
  const packageJsonPath = getPackageJsonPath();
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.peerDependencies = packageJson.peerDependencies || {};
  
  const coreDeps = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {})
  ]);

  dependencies.forEach(dep => {
    if (!coreDeps.has(dep)) {
      packageJson.peerDependencies[dep] = '*';
    }
  });
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json with provider peer dependencies');
}

function installDependencies(dependencies) {
  const packageManager = detectPackageManager();
  const packageJson = JSON.parse(fs.readFileSync(getPackageJsonPath(), 'utf8'));
  
  const coreDeps = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {})
  ]);
  
  const depsToInstall = Array.from(dependencies).filter(dep => !coreDeps.has(dep));
  
  if (depsToInstall.length === 0) return;
  
  console.log('Installing provider dependencies:', depsToInstall.join(', '));
  
  try {
    switch (packageManager) {
      case 'yarn':
        execSync(`yarn add ${depsToInstall.join(' ')} --ignore-scripts`, { stdio: 'inherit' });
        break;
      case 'npm':
      default:
        execSync(`npm install ${depsToInstall.join(' ')} --ignore-scripts`, { stdio: 'inherit' });
        break;
    }
  } catch (err) {
    console.error(`Failed to install dependencies using ${packageManager}:`, err);
    process.exit(1);
  }
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