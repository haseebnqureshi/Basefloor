const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Add this at the beginning of build-providers.js
if (process.env.SKIP_BUILD === 'true') {
  console.log('Skipping build as SKIP_BUILD is set');
  process.exit(0);
}

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

function isDevMode() {
  try {
    require(path.join(getProjectRoot(), 'basefloor.config.js'));
    return false;
  } catch (err) {
    return true;
  }
}

function getPackageJsonPath() {
  return path.join(__dirname, '../package.json');
}

function detectPackageManager() {
  const projectRoot = getProjectRoot();
  return fs.existsSync(path.join(projectRoot, 'yarn.lock')) ? 'yarn' : 'npm';
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
    config = require(path.join(getProjectRoot(), 'basefloor.config.js'));
  } catch (err) {
    console.log('No basefloor.config.js found, loading all provider dependencies');
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
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.dependencies = packageJson.dependencies || {};
  
  const existingDeps = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {})
  ]);

  dependencies.forEach(dep => {
    if (!existingDeps.has(dep)) {
      packageJson.dependencies[dep] = '*';
    }
  });
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated Basefloor package.json with provider dependencies');
}

function getDependenciesToInstall(dependencies) {
  const packageJson = JSON.parse(fs.readFileSync(getPackageJsonPath(), 'utf8'));
  
  const coreDeps = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {})
  ]);
  
  const depsToInstall = Array.from(dependencies).filter(dep => !coreDeps.has(dep));
  
  if (depsToInstall.length === 0) {
    console.log('No new dependencies to install');
    return [];
  }
  
  console.log('Dependencies to install:', depsToInstall.join(', '));
  return depsToInstall;
}

function installDependencies(depsToInstall) {
  if (!depsToInstall.length) return;
  
  const packageManager = detectPackageManager();
  const command = packageManager === 'yarn' 
    ? `yarn add ${depsToInstall.join(' ')} --save`
    : `npm install ${depsToInstall.join(' ')} --save`;
  
  console.log('Running command:', command);
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, SKIP_POSTINSTALL: 'true' }
    });
    
    console.log('Installation complete');
  } catch (err) {
    console.error(`Failed to install dependencies using ${packageManager}:`, err);
    throw err;
  }
}

// Generate the manifest and update package.json
console.log('Scanning providers...');
const { providerDeps, allDeps } = scanProviders();
console.log('Scan complete. Found dependencies:', Array.from(allDeps));

// Save the manifest
console.log('Saving manifest...');
const manifestPath = path.join(__dirname, '../providers/manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(providerDeps, null, 2));
console.log('Manifest saved');

// Capture dependencies to install BEFORE any updates
const depsToInstall = getDependenciesToInstall(allDeps);

// Update package.json with dependencies
console.log('Updating package.json...');
updatePackageJson(allDeps);

// Install all dependencies found
console.log('Checking dependencies to install:', { depsToInstall });
try {
  if (depsToInstall.length > 0) {
    console.log('Installing dependencies...');
    installDependencies(depsToInstall);
    console.log('Dependencies installed successfully');
  } else {
    console.log('No new dependencies to install');
  }
} catch (error) {
  console.error('Error during dependency installation:', error);
  process.exit(1);
}

console.log('Provider manifest generated and dependencies installed'); 