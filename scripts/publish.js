#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Package publishing order (dependencies first)
const packages = [
  { name: '@basefloor/shared', dir: 'packages/shared' },
  { name: '@basefloor/api', dir: 'packages/api' },
  { name: '@basefloor/app', dir: 'packages/app' }
];

const versionType = process.argv[2] || 'patch'; // patch, minor, major

console.log(`🚀 Publishing all packages with version bump: ${versionType}\n`);

async function publishPackage(pkg) {
  console.log(`📦 Processing ${pkg.name}...`);
  
  try {
    // Change to package directory
    process.chdir(path.join(__dirname, '..', pkg.dir));
    
    // Build if build script exists
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log(`✅ Built ${pkg.name}`);
    } catch (e) {
      console.log(`⚠️  No build script for ${pkg.name}, skipping...`);
    }
    
    // Version bump
    execSync(`npm version ${versionType}`, { stdio: 'inherit' });
    console.log(`✅ Version bumped for ${pkg.name}`);
    
    // Publish
    execSync('npm publish', { stdio: 'inherit' });
    console.log(`✅ Published ${pkg.name}\n`);
    
    // Return to root
    process.chdir(path.join(__dirname, '..'));
    
  } catch (error) {
    console.error(`❌ Failed to publish ${pkg.name}:`, error.message);
    process.exit(1);
  }
}

async function main() {
  for (const pkg of packages) {
    await publishPackage(pkg);
  }
  
  console.log('🎉 All packages published successfully!');
  console.log('\n📋 Next steps:');
  console.log('- Verify packages at: https://npmjs.com/org/basefloor');
  console.log('- Update documentation');
  console.log('- Test installation: npm install @basefloor/api');
}

main().catch(console.error); 