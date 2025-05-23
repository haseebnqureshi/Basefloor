#!/usr/bin/env node

/**
 * Documentation Sync Script
 * 
 * This script helps maintain the documentation by syncing content from
 * the main API markdown files to the structured docs folder.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const sourceFiles = {
  'README.md': 'guides/getting-started.md',
  'ROUTES.md': 'reference/routes.md',
  'MODELS.md': 'reference/models.md', 
  'FILES.md': 'api/files.md',
  'TRANSCRIPTION.md': 'reference/transcription.md',
  'EXAMPLE.md': 'examples/complete-config.md'
};

const docsDir = path.join(__dirname, '..');  // Now points to basefloor/docs
const apiDir = path.join(__dirname, '..', '..', 'api');  // Points to basefloor/api

/**
 * Add Jekyll front matter to a markdown file
 */
function addFrontMatter(content, title) {
  const frontMatter = `---
layout: default
title: ${title}
---

`;
  
  // Remove existing front matter if it exists
  const withoutFrontMatter = content.replace(/^---[\s\S]*?---\n\n?/, '');
  
  return frontMatter + withoutFrontMatter;
}

/**
 * Process content for documentation site
 */
function processContent(content, sourceFile) {
  let processed = content;
  
  // Convert relative links to work in docs structure
  processed = processed.replace(/\]\(\.\/([^)]+)\)/g, '](./$1)');
  
  // Add note about auto-generation for some files
  if (['ROUTES.md', 'MODELS.md', 'FILES.md'].includes(sourceFile)) {
    const note = `> **Note**: Parts of this documentation are auto-generated from the codebase. Please refer to the source code for the most up-to-date information.

`;
    processed = note + processed;
  }
  
  return processed;
}

/**
 * Get appropriate title for a file
 */
function getTitle(sourceFile) {
  const titles = {
    'README.md': 'Getting Started',
    'ROUTES.md': 'Routes',
    'MODELS.md': 'Models',
    'FILES.md': 'File Operations API',
    'TRANSCRIPTION.md': 'Audio Transcription',
    'EXAMPLE.md': 'Complete Configuration Example'
  };
  
  return titles[sourceFile] || 'Documentation';
}

/**
 * Sync a single file
 */
function syncFile(sourceFile, targetFile) {
  const sourcePath = path.join(apiDir, sourceFile);
  const targetPath = path.join(docsDir, targetFile);
  
  try {
    // Read source file
    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️  Source file not found: ${sourceFile}`);
      return;
    }
    
    const content = fs.readFileSync(sourcePath, 'utf-8');
    
    // Process content
    const processedContent = processContent(content, sourceFile);
    const title = getTitle(sourceFile);
    const finalContent = addFrontMatter(processedContent, title);
    
    // Ensure target directory exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Write target file
    fs.writeFileSync(targetPath, finalContent);
    console.log(`✅ Synced: ${sourceFile} → ${targetFile}`);
    
  } catch (error) {
    console.error(`❌ Error syncing ${sourceFile}:`, error.message);
  }
}

/**
 * Main sync function
 */
function syncDocs() {
  console.log('🔄 Syncing documentation...\n');
  
  Object.entries(sourceFiles).forEach(([sourceFile, targetFile]) => {
    syncFile(sourceFile, targetFile);
  });
  
  console.log('\n📋 Sync Summary:');
  console.log(`   • Processed ${Object.keys(sourceFiles).length} files`);
  console.log('   • Check git diff to review changes');
  console.log('   • Test locally with: bundle exec jekyll serve');
  console.log('\n✨ Documentation sync complete!');
}

/**
 * Check if docs are up to date
 */
function checkDocs() {
  console.log('🔍 Checking documentation freshness...\n');
  
  let outdated = [];
  
  Object.entries(sourceFiles).forEach(([sourceFile, targetFile]) => {
    const sourcePath = path.join(apiDir, sourceFile);
    const targetPath = path.join(docsDir, targetFile);
    
    if (!fs.existsSync(sourcePath) || !fs.existsSync(targetPath)) {
      return;
    }
    
    const sourceStats = fs.statSync(sourcePath);
    const targetStats = fs.statSync(targetPath);
    
    if (sourceStats.mtime > targetStats.mtime) {
      outdated.push(sourceFile);
    }
  });
  
  if (outdated.length > 0) {
    console.log('📝 Outdated documentation files:');
    outdated.forEach(file => console.log(`   • ${file}`));
    console.log('\n💡 Run "npm run docs:sync" to update');
  } else {
    console.log('✅ All documentation is up to date!');
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'sync':
    syncDocs();
    break;
  case 'check':
    checkDocs();
    break;
  default:
    console.log(`
MinAPI Documentation Sync Tool

Usage:
  node sync-docs.js sync   - Sync all documentation files
  node sync-docs.js check  - Check if docs are up to date

Source files:
${Object.entries(sourceFiles).map(([src, dst]) => `  ${src} → ${dst}`).join('\n')}
`);
    break;
} 