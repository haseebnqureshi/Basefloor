const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns of files to check for
const SENSITIVE_PATTERNS = [
  '**/google-credentials.json',
  '**/gcp-*.json',
  '**/*-credentials.json',
  '**/*.key.json',
  '**/*-key.json',
  '**/*.pem',
  '**/*.key',
  '**/*.cert',
  '**/*.crt',
  '**/.env*'
];

// Files that will be included in the package
function getPackageFiles() {
  const packagePath = path.resolve(__dirname, '..');
  const npmIgnorePath = path.join(packagePath, '.npmignore');
  const gitIgnorePath = path.join(packagePath, '.gitignore');

  // Use npm pack --dry-run to get list of files that would be published
  const { execSync } = require('child_process');
  const packOutput = execSync('npm pack --dry-run', { 
    cwd: packagePath,
    encoding: 'utf8'
  });

  // Extract file list from npm pack output
  const files = packOutput
    .split('\n')
    .filter(line => line.startsWith('npm notice=== Tarball Contents ==='))
    .map(line => line.split(' ').pop())
    .filter(Boolean);

  return files;
}

function findSensitiveFiles() {
  const packagePath = path.resolve(__dirname, '..');
  const sensitivePaths = [];

  // Get files that would be included in the package
  const packageFiles = getPackageFiles();

  // Check each sensitive pattern
  SENSITIVE_PATTERNS.forEach(pattern => {
    const matches = glob.sync(pattern, { 
      cwd: packagePath,
      nodir: true,
      dot: true 
    });

    // Only include files that would be in the package
    matches.forEach(match => {
      if (packageFiles.includes(match)) {
        sensitivePaths.push(match);
      }
    });
  });

  return sensitivePaths;
}

// Main check
try {
  console.log('Checking for sensitive files before publishing...');
  const sensitiveFiles = findSensitiveFiles();

  if (sensitiveFiles.length > 0) {
    console.error('\n⛔️ ERROR: Sensitive files would be included in the package:');
    sensitiveFiles.forEach(file => {
      console.error(`  - ${file}`);
    });
    console.error('\nPlease ensure these files are excluded in .npmignore');
    console.error('Publishing has been cancelled for security.\n');
    process.exit(1);
  }

  console.log('✅ No sensitive files found. Safe to publish.\n');
  process.exit(0);
} catch (error) {
  console.error('Error checking for sensitive files:', error);
  process.exit(1);
} 