const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the version bump type from command line arguments
const bumpType = process.argv[2] || 'patch';

// Validate bump type
if (!['major', 'minor', 'patch'].includes(bumpType)) {
  console.error('Invalid bump type. Use: major, minor, or patch');
  process.exit(1);
}

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Split version into major.minor.patch
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Bump version based on type
switch (bumpType) {
  case 'major':
    packageJson.version = `${major + 1}.0.0`;
    break;
  case 'minor':
    packageJson.version = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    packageJson.version = `${major}.${minor}.${patch + 1}`;
    break;
}

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Main publish function
const publish = () => {
  try {
    // Run prepublishOnly script
    console.log('Running prepublish checks...');
    execSync('npm run prepublishOnly', { stdio: 'inherit' });

    // Publish to npm with appropriate access based on package.json private flag
    const isPrivate = packageJson.private === true;
    const publishCommand = isPrivate ? 'npm publish --access private' : 'npm publish';
    console.log(`Publishing version ${packageJson.version} to npm...`);
    execSync(publishCommand, { stdio: 'inherit' });

    // Commit the version change
    console.log('Committing version change...');
    execSync(`git add package.json && git commit -m "chore: bump version to ${packageJson.version}"`, { stdio: 'inherit' });

    console.log(`Successfully published version ${packageJson.version} to npm!`);
  } catch (error) {
    console.error('Error during publish:', error.message);
    process.exit(1);
  }
};

// Run the publish function
publish(); 