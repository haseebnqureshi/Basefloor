#!/usr/bin/env node

/**
 * Core Documentation Generator for Basefloor
 * 
 * This script automatically generates comprehensive documentation by:
 * - Extracting route definitions from code
 * - Parsing model schemas
 * - Analyzing configuration structure
 * - Creating both human-readable markdown and LLM-optimized JSON
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CoreDocGenerator {
  constructor() {
    this.docsDir = path.join(__dirname, '..');
    this.apiDir = path.join(__dirname, '..', '..', 'packages', 'api');
    this.exampleDir = path.join(__dirname, '..', '..', 'example', 'api');
    this.sampleConfigPath = path.join(__dirname, 'sample-config.js');
    
    // Store extracted documentation data
    this.docs = {
      routes: [],
      models: {},
      config: {},
      examples: {},
      metadata: {
        generated_at: new Date().toISOString(),
        basefloor_version: this.getPackageVersion()
      }
    };
  }

  /**
   * Get the current Basefloor version from package.json
   */
  getPackageVersion() {
    try {
      const packagePath = path.join(this.apiDir, 'package.json');
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      return packageData.version || 'unknown';
    } catch (error) {
      console.warn('Could not read package version:', error.message);
      return 'unknown';
    }
  }

  /**
   * Main generation method
   */
  async generate() {
    console.log('🚀 Starting Basefloor documentation generation...\n');
    
    try {
      // Extract documentation from code
      await this.extractRoutesFromCode();
      await this.extractModelsFromCode();
      await this.extractConfigSchema();
      await this.extractExamples();
      
      // Generate output files
      await this.generateMarkdownFiles();
      await this.generateLLMReference();
      
      console.log('\n✨ Documentation generation complete!');
      console.log(`📁 Generated files in: ${this.docsDir}`);
    } catch (error) {
      console.error('❌ Error generating documentation:', error);
      process.exit(1);
    }
  }

  /**
   * Extract route definitions from routes/index.js
   */
  async extractRoutesFromCode() {
    console.log('📍 Extracting routes...');
    
    // First extract built-in routes (Files)
    await this.extractBuiltInRoutes();
    
    const routesPath = path.join(this.apiDir, 'routes', 'index.js');
    const routesCode = fs.readFileSync(routesPath, 'utf-8');
    
    // Extract JSDoc comments for routes
    const jsdocPattern = /\/\*\*[\s\S]*?\*\//g;
    const routePattern = /API\[(get|post|put|delete)\]\s*\(\s*['"`]([^'"`]+)['"`]/g;
    
    // Parse route configuration from sample config
    const configPath = this.sampleConfigPath;
    if (fs.existsSync(configPath)) {
      // Load the config module safely
      try {
        // Read and parse the config file
        const configContent = fs.readFileSync(configPath, 'utf-8');
        
        // Extract routes section - look for routes: { ... }
        const routesMatch = configContent.match(/routes:\s*{([\s\S]*?)^(\s{4}\}|\s{2}\})/m);
        if (routesMatch) {
          // Parse individual routes more carefully
          const routesContent = routesMatch[1];
          
          // Split by route definitions and process each
          const routeBlocks = routesContent.split(/^\s*["']/m).filter(Boolean);
          
          routeBlocks.forEach(block => {
            // Extract URL and config
            const urlMatch = block.match(/^([^"']+)["']\s*:\s*\{/);
            if (urlMatch) {
              const url = urlMatch[1];
              
              // Find the matching closing brace for this route
              let braceCount = 0;
              let configEnd = -1;
              let inString = false;
              let stringChar = null;
              
              for (let i = block.indexOf('{'); i < block.length; i++) {
                const char = block[i];
                
                // Handle string boundaries
                if ((char === '"' || char === "'") && block[i-1] !== '\\') {
                  if (!inString) {
                    inString = true;
                    stringChar = char;
                  } else if (char === stringChar) {
                    inString = false;
                  }
                }
                
                // Count braces only outside strings
                if (!inString) {
                  if (char === '{') braceCount++;
                  if (char === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                      configEnd = i + 1;
                      break;
                    }
                  }
                }
              }
              
              if (configEnd > 0) {
                const config = block.substring(block.indexOf('{'), configEnd);
                // Debug logging
                if (url === '/users(Users)') {
                  console.log('  🔍 Parsing route:', url);
                  console.log('  📋 Config:', config);
                }
                this.parseRouteConfig(url, config);
              }
            }
          });
        }
      } catch (error) {
        console.warn('  ⚠️  Could not parse config file:', error.message);
      }
    }
    
    console.log(`  ✓ Found ${this.docs.routes.length} routes`);
  }

  /**
   * Extract built-in routes from API package (Files, Auth)
   */
  async extractBuiltInRoutes() {
    console.log('  📁 Extracting built-in Files routes...');
    
    // Extract Files routes
    const filesRoutesPath = path.join(this.apiDir, 'files', 'routes.js');
    if (fs.existsSync(filesRoutesPath)) {
      const filesRoutesCode = fs.readFileSync(filesRoutesPath, 'utf-8');
      
      // Parse Files routes using regex
      const routePattern = /API\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
      let match;
      const filesRoutes = [];
      
      while ((match = routePattern.exec(filesRoutesCode)) !== null) {
        const [, method, path] = match;
        filesRoutes.push({ method: method.toUpperCase(), path });
      }
      
      // Group routes by base path
      const routeGroups = {};
      filesRoutes.forEach(({ method, path }) => {
        // Determine operation type and base path
        let operation = '';
        let key = '';
        let basePath = path;
        
        // Special handling for different file routes
        if (path === '/files/:_id?' || path === '/files/:_id') {
          // This route handles both readAll (no ID) and read (with ID)
          if (method === 'GET') {
            // Create two separate route entries for the same endpoint
            // 1. ReadAll - GET /files (no ID)
            const readAllBasePath = '/files';
            if (!routeGroups[readAllBasePath]) {
              routeGroups[readAllBasePath] = {
                url: readAllBasePath,
                methods: [],
                model: 'Files',
                permissions: {},
                filters: {}
              };
            }
            routeGroups[readAllBasePath].methods.push({
              method,
              operation: 'readAll',
              key: 'rA',
              endpoint: readAllBasePath,
              permissions: 'auth',
              filter: null
            });
            
            // 2. Read - GET /files/:id (with ID)
            basePath = '/files/:id';
            operation = 'read';
            key = 'r';
          } else if (method === 'PUT') {
            basePath = '/files/:id';
            operation = 'update';
            key = 'u';
          } else if (method === 'DELETE') {
            basePath = '/files/:id';
            operation = 'delete';
            key = 'd';
          }
        } else if (path === '/files') {
          if (method === 'POST') {
            operation = 'create';
            key = 'c';
          } else if (method === 'GET') {
            operation = 'readAll';
            key = 'rA';
          }
        } else if (path.includes('/download')) {
          basePath = '/files/:id/download';
          operation = 'download';
          key = 'download';
        } else if (path === '/files/:_id/files') {
          basePath = '/files/:id/files';
          operation = 'list-children';
          key = 'list-children';
        } else if (path === '/convert/:to?') {
          basePath = '/convert/:to';
          operation = 'check-conversion';
          key = 'check-conversion';
        } else if (path === '/files/:_id/convert') {
          basePath = '/files/:id/convert';
          operation = 'convert';
          key = 'convert';
        }
        
        if (operation) {
          if (!routeGroups[basePath]) {
            routeGroups[basePath] = {
              url: basePath,
              methods: [],
              model: 'Files',
              permissions: {},
              filters: {}
            };
          }
          
          routeGroups[basePath].methods.push({
            method,
            operation,
            key,
            endpoint: basePath,
            permissions: 'auth', // Files routes require authentication
            filter: null
          });
        }
      });
      
      // Add to docs.routes
      Object.values(routeGroups).forEach(route => {
        this.docs.routes.push(route);
      });
      
      console.log(`  ✓ Found ${Object.keys(routeGroups).length} Files route groups`);
    }
    
    // Extract Auth routes
    console.log('  🔐 Extracting built-in Auth routes...');
    const authRoutesPath = path.join(this.apiDir, 'auth', 'routes.js');
    if (fs.existsSync(authRoutesPath)) {
      const authRoutesCode = fs.readFileSync(authRoutesPath, 'utf-8');
      
      // Parse Auth routes
      const routePattern = /API\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
      let match;
      const authRoutes = [];
      
      while ((match = routePattern.exec(authRoutesCode)) !== null) {
        const [, method, path] = match;
        authRoutes.push({ method: method.toUpperCase(), path });
      }
      
      // Add auth routes to docs
      authRoutes.forEach(({ method, path }) => {
        let operation = '';
        if (path.includes('/register')) operation = 'register';
        else if (path.includes('/login')) operation = 'login';
        else if (path.includes('/verify')) operation = 'verify';
        else if (path.includes('/forgot')) operation = 'forgot-password';
        else if (path.includes('/reset')) operation = 'reset-password';
        
        if (operation) {
          this.docs.routes.push({
            url: path,
            methods: [{
              method,
              operation,
              key: operation,
              endpoint: path,
              permissions: false, // Auth routes don't require authentication
              filter: null
            }],
            model: 'Users',
            permissions: { [operation]: false },
            filters: {}
          });
        }
      });
      
      console.log(`  ✓ Found ${authRoutes.length} Auth routes`);
    }
  }

  /**
   * Parse individual route configuration
   */
  parseRouteConfig(url, configStr) {
    const route = {
      url,
      methods: [],
      model: null,
      permissions: {},
      filters: {}
    };
    
    // Extract model from URL pattern
    const modelMatch = url.match(/\(([^)]+)\)/);
    if (modelMatch) {
      route.model = modelMatch[1];
    }
    
    // Parse CRUD operations
    const operations = {
      'c': { method: 'POST', operation: 'create' },
      'rA': { method: 'GET', operation: 'readAll' },
      'r': { method: 'GET', operation: 'read' },
      'u': { method: 'PUT', operation: 'update' },
      'd': { method: 'DELETE', operation: 'delete' }
    };
    
    for (const [key, info] of Object.entries(operations)) {
      // Look for operation key at the start of a line or after whitespace
      const opPattern = new RegExp(`\\b${key}\\s*:\\s*{([^}]+(?:{[^}]*}[^}]*)*)}`);
      const opMatch = configStr.match(opPattern);
      
      if (opMatch) {
        const opConfig = opMatch[1];
        
        // Extract permissions - handle various formats
        let permissions = null;
        
        // Try to match different permission patterns
        const allowPatterns = [
          /allow:\s*"([^"]+)"/,  // String in quotes
          /allow:\s*'([^']+)'/,  // String in single quotes
          /allow:\s*(true|false)/,  // Boolean
          /allow:\s*({[\s\S]+?})/  // Object
        ];
        
        for (const pattern of allowPatterns) {
          const match = opConfig.match(pattern);
          if (match) {
            permissions = match[1];
            break;
          }
        }
        
        // Extract filters similarly
        let filter = null;
        const filterMatch = opConfig.match(/filter:\s*["']([^"']+)["']/);
        if (filterMatch) {
          filter = filterMatch[1];
        }
        
        route.methods.push({
          ...info,
          key,
          endpoint: this.buildEndpoint(url, key),
          permissions: permissions || null,
          filter: filter || null
        });
        
        // Store in route-level collections too
        route.permissions[key] = permissions;
        route.filters[key] = filter;
      }
    }
    
    this.docs.routes.push(route);
  }

  /**
   * Parse permission string or object
   */
  parsePermission(permStr) {
    // Remove quotes if it's a simple string
    permStr = permStr.trim();
    
    if (permStr.startsWith('"') || permStr.startsWith("'")) {
      return permStr.slice(1, -1);
    }
    
    if (permStr === 'true' || permStr === 'false') {
      return permStr === 'true';
    }
    
    // Handle complex permissions (simplified)
    if (permStr.includes('{')) {
      return permStr; // Return as-is for now
    }
    
    return permStr;
  }

  /**
   * Build endpoint URL based on route pattern and operation
   */
  buildEndpoint(urlPattern, operation) {
    let endpoint = urlPattern.replace(/\([^)]+\)/, '');
    
    if (['r', 'u', 'd'].includes(operation)) {
      // These operations typically need an ID parameter
      endpoint += '/:id';
    }
    
    return endpoint;
  }

  /**
   * Extract model definitions from models/index.js
   */
  async extractModelsFromCode() {
    console.log('📊 Extracting models...');
    
    // Only extract models that are built into the API package
    this.docs.models = {};
    
    // 1. Extract the Files model from models/index.js
    const modelsPath = path.join(this.apiDir, 'models', 'index.js');
    const modelsCode = fs.readFileSync(modelsPath, 'utf-8');
    
    // Extract the default Files model
    const filesModelMatch = modelsCode.match(/models\.Files\s*=\s*{([\s\S]*?)^(\s{8}\}|\s{4}\})/m);
    if (filesModelMatch) {
      this.docs.models.Files = this.parseModelDefinition(filesModelMatch[1]);
    }
    
    // 2. Extract the Users model from auth/index.js
    const authPath = path.join(this.apiDir, 'auth', 'index.js');
    if (fs.existsSync(authPath)) {
      const authCode = fs.readFileSync(authPath, 'utf-8');
      
      // Look for Users model definition in auth
      const usersModelMatch = authCode.match(/models\.Users\s*=\s*{([\s\S]*?)^(\s{8}\}|\s{4}\})/m);
      if (usersModelMatch) {
        this.docs.models.Users = this.parseModelDefinition(usersModelMatch[1]);
      } else {
        // If not found in that format, create a basic Users model based on auth requirements
        this.docs.models.Users = {
          collection: 'user',
          labels: ['User', 'Users'],
          fields: {
            _id: { type: 'ObjectId', operations: ['r', 'd'], defaultValue: null },
            email: { type: 'String', operations: ['c', 'r', 'u'], defaultValue: null },
            password: { type: 'String', operations: ['c'], defaultValue: null },
            created_at: { type: 'Date', operations: ['r'], defaultValue: null },
            updated_at: { type: 'Date', operations: ['r'], defaultValue: null }
          },
          filters: {}
        };
      }
    }
    
    // DO NOT extract from example configs or other files outside packages/api
    
    console.log(`  ✓ Found ${Object.keys(this.docs.models).length} built-in models`);
  }

  /**
   * Parse individual model definition
   */
  parseModelDefinition(modelStr) {
    const model = {
      collection: null,
      labels: [],
      fields: {},
      filters: {}
    };
    
    // Extract collection name
    const collectionMatch = modelStr.match(/collection:\s*['"`]([^'"`]+)['"`]/);
    if (collectionMatch) {
      model.collection = collectionMatch[1];
    }
    
    // Extract labels
    const labelsMatch = modelStr.match(/labels:\s*\[([^\]]+)\]/);
    if (labelsMatch) {
      model.labels = labelsMatch[1].split(',').map(l => l.trim().replace(/['"`]/g, ''));
    }
    
    // Extract fields from values object
    const valuesMatch = modelStr.match(/values:\s*{([^}]+)}/s);
    if (valuesMatch) {
      const fieldsStr = valuesMatch[1];
      const fieldPattern = /(\w+):\s*\[([^\]]+)\]/g;
      let match;
      
      while ((match = fieldPattern.exec(fieldsStr)) !== null) {
        const [, fieldName, fieldConfig] = match;
        const parts = fieldConfig.split(',').map(p => p.trim().replace(/['"`]/g, ''));
        
        model.fields[fieldName] = {
          type: parts[0],
          operations: parts[1] ? parts[1].split('') : [],
          defaultValue: parts[2] || null
        };
      }
    }
    
    return model;
  }

  /**
   * Parse models from config file
   */
  parseModelsFromConfig(modelsStr) {
    // This is a simplified parser - in production, we'd use a proper AST parser
    const modelPattern = /(\w+):\s*{([^}]+(?:{[^}]*}[^}]*)*)}/g;
    let match;
    
    while ((match = modelPattern.exec(modelsStr)) !== null) {
      const [, modelName, modelConfig] = match;
      if (!this.docs.models[modelName]) {
        this.docs.models[modelName] = this.parseModelDefinition(modelConfig);
      }
    }
  }

  /**
   * Extract configuration schema
   */
  async extractConfigSchema() {
    console.log('⚙️  Extracting configuration schema...');
    
    // Define the configuration schema based on Basefloor's structure
    this.docs.config = {
      name: {
        type: 'string',
        required: false,
        description: 'The name of your API',
        example: 'My Basefloor API'
      },
      mongodb: {
        type: 'object',
        required: true,
        description: 'MongoDB connection configuration',
        properties: {
          uri: {
            type: 'string',
            required: true,
            description: 'MongoDB connection URI',
            example: 'mongodb://localhost:27017/myapp',
            env: 'MONGODB_URI'
          }
        }
      },
      jwt: {
        type: 'object',
        required: true,
        description: 'JWT authentication configuration',
        properties: {
          secret: {
            type: 'string',
            required: true,
            description: 'Secret key for JWT token signing',
            example: 'your-secret-key-change-in-production',
            env: 'JWT_SECRET'
          }
        }
      },
      cors: {
        type: 'object',
        required: false,
        description: 'CORS configuration',
        properties: {
          origin: {
            type: 'string',
            required: false,
            description: 'Allowed CORS origin',
            example: 'http://localhost:3000',
            env: 'FRONTEND_URL'
          }
        }
      },
      models: {
        type: 'object',
        required: true,
        description: 'Model definitions for your API',
        example: '{ Users: { ... }, Posts: { ... } }'
      },
      routes: {
        type: 'object',
        required: false,
        description: 'Route definitions with permissions',
        example: '{ "/users(Users)": { c: { allow: true }, r: { allow: true } } }'
      }
    };
    
    console.log('  ✓ Configuration schema extracted');
  }

  /**
   * Extract examples from test files and example directory
   */
  async extractExamples() {
    console.log('🧪 Extracting examples...');
    
    // Look for test files
    const testFiles = this.findFiles(this.apiDir, '**/*.test.js');
    
    for (const testFile of testFiles) {
      const testContent = fs.readFileSync(testFile, 'utf-8');
      // Extract test examples (simplified - would use AST parser in production)
      const examples = this.extractTestExamples(testContent);
      
      const testName = path.basename(testFile, '.test.js');
      this.docs.examples[testName] = examples;
    }
    
    console.log(`  ✓ Extracted examples from ${testFiles.length} test files`);
  }

  /**
   * Extract examples from test content
   */
  extractTestExamples(testContent) {
    const examples = [];
    
    // Look for API calls in tests
    const apiCallPattern = /API\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`][\s\S]*?\)/g;
    let match;
    
    while ((match = apiCallPattern.exec(testContent)) !== null) {
      const [fullMatch, method, endpoint] = match;
      examples.push({
        method: method.toUpperCase(),
        endpoint,
        code: fullMatch
      });
    }
    
    return examples;
  }

  /**
   * Generate markdown documentation files
   */
  async generateMarkdownFiles() {
    console.log('\n📝 Generating markdown files...');
    
    // Generate routes documentation
    await this.generateRoutesMarkdown();
    
    // Generate models documentation
    await this.generateModelsMarkdown();
    
    // Generate configuration documentation
    await this.generateConfigMarkdown();
  }

  /**
   * Generate routes markdown documentation
   */
  async generateRoutesMarkdown() {
    const routesDir = path.join(this.docsDir, 'api', 'routes');
    if (!fs.existsSync(routesDir)) {
      fs.mkdirSync(routesDir, { recursive: true });
    }
    
    // Generate index file
    let indexContent = `# API Routes

This documentation is auto-generated from the Basefloor codebase.

## Available Routes

`;
    
    // Group routes by model
    const routesByModel = {};
    this.docs.routes.forEach(route => {
      const model = route.model || 'General';
      if (!routesByModel[model]) {
        routesByModel[model] = [];
      }
      routesByModel[model].push(route);
    });
    
    // Generate documentation for each model's routes
    for (const [model, routes] of Object.entries(routesByModel)) {
      indexContent += `\n### ${model}\n\n`;
      
      routes.forEach(route => {
        route.methods.forEach(method => {
          const fileName = `${model.toLowerCase()}-${method.operation}.md`;
          indexContent += `- [${method.method} ${method.endpoint}](./${fileName}) - ${method.operation} ${model}\n`;
          
          // Generate individual route file
          this.generateRouteFile(routesDir, fileName, model, route, method);
        });
      });
    }
    
    fs.writeFileSync(path.join(routesDir, 'index.md'), indexContent);
    console.log('  ✓ Generated routes documentation');
  }

  /**
   * Generate individual route documentation file
   */
  generateRouteFile(dir, fileName, model, route, method) {
    // Determine if authentication is required based on permissions
    const authRequired = this.isAuthRequired(method.permissions);
    
    const content = `# ${method.method} ${method.endpoint}

## ${method.operation} ${model}

### Endpoint

\`\`\`
${method.method} ${method.endpoint}
\`\`\`

### Authentication

${authRequired ? '🔒 Required' : '🔓 Not required'}

### Permissions

${this.formatPermissions(method.permissions)}

${method.filter ? `### Filters

\`\`\`
${method.filter}
\`\`\`

` : ''}### Request

${this.formatRequestBody(model, method.operation)}

### Response

${this.formatResponse(model, method.operation)}

### Example

${this.formatExample(method)}

---

*Generated on ${new Date().toISOString()}*
`;
    
    fs.writeFileSync(path.join(dir, fileName), content);
  }

  /**
   * Determine if authentication is required based on permissions
   */
  isAuthRequired(permissions) {
    if (!permissions) return true; // Default to required
    if (permissions === true) return false; // Explicitly public
    if (permissions === false) return true; // Explicitly requires auth
    
    // If permissions reference @req_user, authentication is required
    if (typeof permissions === 'string' && permissions.includes('@req_user')) {
      return true;
    }
    
    return true; // Default to required for complex permissions
  }

  /**
   * Generate models markdown documentation
   */
  async generateModelsMarkdown() {
    const modelsDir = path.join(this.docsDir, 'api', 'models');
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }
    
    // Generate index
    let indexContent = `# Models

This documentation is auto-generated from the Basefloor model definitions.

## Available Models

`;
    
    for (const [modelName, model] of Object.entries(this.docs.models)) {
      const fileName = `${modelName.toLowerCase()}.md`;
      indexContent += `- [${modelName}](./${fileName}) - ${model.labels.join(', ')}\n`;
      
      // Generate individual model file
      this.generateModelFile(modelsDir, fileName, modelName, model);
    }
    
    fs.writeFileSync(path.join(modelsDir, 'index.md'), indexContent);
    console.log('  ✓ Generated models documentation');
  }

  /**
   * Generate individual model documentation file
   */
  generateModelFile(dir, fileName, modelName, model) {
    const content = `# ${modelName} Model

## Overview

- **Collection**: \`${model.collection}\`
- **Labels**: ${model.labels.join(', ')}

## Fields

| Field | Type | Operations | Default | Description |
|-------|------|------------|---------|-------------|
${Object.entries(model.fields).map(([fieldName, field]) => 
  `| ${fieldName} | ${field.type} | ${this.formatOperations(field.operations)} | ${field.defaultValue || '-'} | ${this.getFieldDescription(fieldName)} |`
).join('\n')}

## Operations

${this.formatModelOperations(model)}

## Filters

${this.formatModelFilters(model)}

## Examples

${this.formatModelExamples(modelName)}

---

*Generated on ${new Date().toISOString()}*
`;
    
    fs.writeFileSync(path.join(dir, fileName), content);
  }

  /**
   * Generate configuration markdown documentation
   */
  async generateConfigMarkdown() {
    const content = `# Configuration

This page documents all configuration options for Basefloor.

## Configuration Schema

${this.formatConfigSchema(this.docs.config)}

## Example Configuration

\`\`\`javascript
module.exports = (API) => {
  return {
    // API Name
    name: 'My Basefloor API',
    
    // Database configuration
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp'
    },
    
    // Authentication configuration
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    },
    
    // CORS configuration
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000'
    },
    
    // Models configuration
    models: {
      // Your models here
    },
    
    // Routes configuration
    routes: {
      // Your routes here
    }
  };
};
\`\`\`

## Environment Variables

${this.formatEnvironmentVariables()}

---

*Generated on ${new Date().toISOString()}*
`;
    
    const configPath = path.join(this.docsDir, 'guide', 'configuration.md');
    fs.writeFileSync(configPath, content);
    console.log('  ✓ Generated configuration documentation');
  }

  /**
   * Generate LLM reference file
   */
  async generateLLMReference() {
    console.log('\n🤖 Generating LLM reference...');
    
    const llmReference = {
      basefloor_version: this.docs.metadata.basefloor_version,
      last_updated: this.docs.metadata.generated_at,
      quick_start: {
        install: 'npm install @basefloor/api',
        minimal_config: `module.exports = (API) => ({
  mongodb: { uri: 'mongodb://localhost:27017/myapp' },
  jwt: { secret: 'your-secret-key' }
});`,
        run: 'node index.js'
      },
      routes: this.formatRoutesForLLM(),
      models: this.formatModelsForLLM(),
      config_schema: this.docs.config,
      common_patterns: this.getCommonPatterns()
    };
    
    const llmPath = path.join(this.docsDir, 'llm-reference.json');
    fs.writeFileSync(llmPath, JSON.stringify(llmReference, null, 2));
    console.log('  ✓ Generated LLM reference');
  }

  // Helper methods for formatting

  formatPermissions(permissions) {
    if (!permissions) return 'No specific permissions required';
    return '```json\n' + JSON.stringify(permissions, null, 2) + '\n```';
  }

  formatRequestBody(model, operation) {
    if (['read', 'readAll', 'delete', 'download', 'list-children', 'check-conversion'].includes(operation)) {
      return 'No request body required';
    }
    
    // Handle special Files operations
    if (model === 'Files') {
      if (operation === 'create') {
        return `**Headers:**
\`\`\`
minapi-name: filename.jpg
minapi-size: 1024000
minapi-type: image/jpeg
minapi-modified: 2024-01-01T00:00:00.000Z
minapi-prefix: user-uploads  // optional
\`\`\`

**Body:** Binary file data (multipart/form-data)`;
      }
      
      if (operation === 'convert') {
        return 'No request body required - conversion is triggered by the file ID in the URL';
      }
    }
    
    const modelDef = this.docs.models[model];
    if (!modelDef) return 'Model definition not found';
    
    const fields = Object.entries(modelDef.fields)
      .filter(([, field]) => field.operations.includes(operation[0]))
      .map(([name, field]) => `  "${name}": ${this.getExampleValue(field.type)}`);
    
    return '```json\n{\n' + fields.join(',\n') + '\n}\n```';
  }

  formatResponse(model, operation) {
    // Handle special Files operations
    if (model === 'Files') {
      const fileExamples = {
        create: `{
  "_id": "507f1f77bcf86cd799439011",
  "filename": "abc123def456.jpg",
  "name": "profile-photo.jpg",
  "size": 1024000,
  "content_type": "image/jpeg",
  "hash": "abc123def456",
  "key": "user-uploads/abc123def456.jpg",
  "url": "https://cdn.example.com/user-uploads/abc123def456.jpg",
  "uploaded_at": "2024-01-01T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z"
}`,
        read: `{
  "_id": "507f1f77bcf86cd799439011",
  "filename": "abc123def456.jpg",
  "name": "profile-photo.jpg",
  "size": 1024000,
  "content_type": "image/jpeg",
  "hash": "abc123def456",
  "key": "user-uploads/abc123def456.jpg",
  "url": "https://cdn.example.com/user-uploads/abc123def456.jpg",
  "uploaded_at": "2024-01-01T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z"
}`,
        readAll: `[
  {
    "_id": "507f1f77bcf86cd799439011",
    "filename": "abc123def456.jpg",
    "name": "profile-photo.jpg",
    "size": 1024000,
    "content_type": "image/jpeg",
    // ... other file fields
  }
]`,
        download: `Binary file data with appropriate Content-Type header`,
        convert: `[
  {
    "_id": "507f1f77bcf86cd799439012",
    "filename": "converted123.png",
    "name": "profile-photo (1 of 1)",
    "size": 2048000,
    "content_type": "image/png",
    "parent_file": "507f1f77bcf86cd799439011",
    // ... other file fields
  }
]`,
        'list-children': `[
  {
    "_id": "507f1f77bcf86cd799439012",
    "parent_file": "507f1f77bcf86cd799439011",
    "name": "profile-photo (1 of 3)",
    // ... other file fields
  }
]`,
        'check-conversion': `{
  "extension": ".pdf",
  "accepted": true,
  "to": ".png"
}`,
        files: `[
  {
    "_id": "507f1f77bcf86cd799439012",
    "parent_file": "507f1f77bcf86cd799439011",
    "name": "profile-photo (1 of 3)",
    // ... other file fields
  }
]`
      };
      
      return '```json\n' + (fileExamples[operation] || fileExamples.read) + '\n```';
    }
    
    const examples = {
      create: '{\n  "insertedId": "507f1f77bcf86cd799439011"\n}',
      read: '{\n  "_id": "507f1f77bcf86cd799439011",\n  // ... model fields\n}',
      readAll: '[\n  {\n    "_id": "507f1f77bcf86cd799439011",\n    // ... model fields\n  }\n]',
      update: '{\n  "modifiedCount": 1\n}',
      delete: '{\n  "deletedCount": 1\n}'
    };
    
    return '```json\n' + (examples[operation] || '{}') + '\n```';
  }

  formatExample(method) {
    // Special examples for Files operations
    if (method.endpoint.startsWith('/files')) {
      if (method.operation === 'create') {
        return `\`\`\`javascript
// Upload a file using FormData
const formData = new FormData();
const file = document.querySelector('input[type="file"]').files[0];

const response = await fetch('/files', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'minapi-name': file.name,
    'minapi-size': file.size.toString(),
    'minapi-type': file.type,
    'minapi-modified': new Date(file.lastModified).toISOString(),
    'minapi-prefix': 'user-uploads' // optional
  },
  body: file
});

const uploadedFile = await response.json();
\`\`\``;
      }
      
      if (method.operation === 'download') {
        return `\`\`\`javascript
// Download a file
const response = await fetch('/files/${method.endpoint.includes(':id') ? 'FILE_ID' : ''}/download', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

// Option 1: Get as blob
const blob = await response.blob();
const url = URL.createObjectURL(blob);
window.open(url);

// Option 2: Force download
const downloadResponse = await fetch('/files/FILE_ID/download?force=true', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
\`\`\``;
      }
      
      if (method.operation === 'convert') {
        return `\`\`\`javascript
// Convert a file (e.g., PDF to PNG)
const response = await fetch('/files/FILE_ID/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
});

const convertedFiles = await response.json();
console.log('Converted files:', convertedFiles);
\`\`\``;
      }
      
      if (method.operation === 'list-children') {
        return `\`\`\`javascript
// Get all child files (e.g., converted versions)
const response = await fetch('/files/PARENT_FILE_ID/files', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const childFiles = await response.json();
console.log('Child files:', childFiles);
\`\`\``;
      }
      
      if (method.operation === 'check-conversion') {
        return `\`\`\`javascript
// Check if a file type can be converted
const response = await fetch('/convert/pdf', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const conversionInfo = await response.json();
// Response: { extension: ".pdf", accepted: true, to: ".png" }
\`\`\``;
      }
    }
    
    // Default example for other operations
    return `\`\`\`javascript
// Using fetch
const response = await fetch('${method.endpoint}', {
  method: '${method.method}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  }${method.method !== 'GET' ? `,
  body: JSON.stringify({
    // Your data here
  })` : ''}
});

const data = await response.json();
\`\`\``;
  }

  formatOperations(operations) {
    const opMap = {
      'c': 'Create',
      'r': 'Read',
      'u': 'Update',
      'd': 'Delete'
    };
    return operations.map(op => opMap[op] || op).join(', ');
  }

  getFieldDescription(fieldName) {
    const descriptions = {
      '_id': 'Unique identifier',
      'created_at': 'Creation timestamp',
      'updated_at': 'Last update timestamp',
      'user_id': 'Reference to user',
      'email': 'User email address',
      'password': 'Hashed password',
      'name': 'Display name',
      'title': 'Title or heading',
      'description': 'Detailed description',
      'content': 'Main content',
      'status': 'Current status',
      'type': 'Type classification',
      'url': 'URL or link',
      'file': 'File reference',
      'hash': 'Content hash',
      'size': 'Size in bytes'
    };
    
    return descriptions[fieldName] || '-';
  }

  formatModelOperations(model) {
    return `
### Create
\`\`\`javascript
const result = await API.DB.${model.collection}.create({ values: { /* ... */ } });
\`\`\`

### Read
\`\`\`javascript
const item = await API.DB.${model.collection}.read({ where: { _id: 'id' } });
\`\`\`

### Read All
\`\`\`javascript
const items = await API.DB.${model.collection}.readAll({ where: { /* ... */ } });
\`\`\`

### Update
\`\`\`javascript
const result = await API.DB.${model.collection}.update({ 
  where: { _id: 'id' }, 
  values: { /* ... */ } 
});
\`\`\`

### Delete
\`\`\`javascript
const result = await API.DB.${model.collection}.delete({ where: { _id: 'id' } });
\`\`\`
`;
  }

  formatModelFilters(model) {
    if (!model.filters || Object.keys(model.filters).length === 0) {
      return 'No filters defined for this model.';
    }
    
    return 'Filters are defined for this model. See the model definition for details.';
  }

  formatModelExamples(modelName) {
    // Helper function to properly pluralize model names
    const pluralize = (name) => {
      if (name.toLowerCase().endsWith('s')) {
        return name; // Already plural (e.g., "Files" stays "Files")
      }
      return name + 's'; // Add 's' for singular names (e.g., "User" becomes "Users")
    };
    
    const pluralName = pluralize(modelName);
    const variableName = modelName.toLowerCase();
    
    return `
### Creating a ${modelName}
\`\`\`javascript
const new${modelName} = await API.DB.${modelName}.create({
  values: {
    // Add your field values here
  }
});
\`\`\`

### Finding ${pluralName}
\`\`\`javascript
const ${variableName} = await API.DB.${modelName}.readAll({
  where: {
    // Add your query conditions
  }
});
\`\`\`
`;
  }

  formatConfigSchema(schema, indent = '') {
    let output = '';
    
    for (const [key, config] of Object.entries(schema)) {
      output += `\n${indent}### ${key}\n\n`;
      output += `${indent}- **Type**: \`${config.type}\`\n`;
      output += `${indent}- **Required**: ${config.required ? 'Yes' : 'No'}\n`;
      output += `${indent}- **Description**: ${config.description}\n`;
      
      if (config.env) {
        output += `${indent}- **Environment Variable**: \`${config.env}\`\n`;
      }
      
      if (config.example) {
        output += `${indent}- **Example**: \`${config.example}\`\n`;
      }
      
      if (config.properties) {
        output += `\n${indent}#### Properties\n`;
        output += this.formatConfigSchema(config.properties, indent + '  ');
      }
    }
    
    return output;
  }

  formatEnvironmentVariables() {
    const envVars = [];
    
    const extractEnvVars = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        if (value.env) {
          envVars.push({
            name: value.env,
            description: value.description,
            example: value.example,
            required: value.required
          });
        }
        if (value.properties) {
          extractEnvVars(value.properties, prefix + key + '.');
        }
      }
    };
    
    extractEnvVars(this.docs.config);
    
    let output = '| Variable | Description | Required | Example |\n';
    output += '|----------|-------------|----------|----------|\n';
    
    envVars.forEach(env => {
      output += `| ${env.name} | ${env.description} | ${env.required ? 'Yes' : 'No'} | ${env.example || '-'} |\n`;
    });
    
    return output;
  }

  formatRoutesForLLM() {
    return this.docs.routes.map(route => ({
      pattern: route.url,
      model: route.model,
      endpoints: route.methods.map(m => ({
        method: m.method,
        path: m.endpoint,
        operation: m.operation,
        auth_required: true,
        permissions: route.permissions[m.key]
      }))
    }));
  }

  formatModelsForLLM() {
    const models = {};
    
    for (const [name, model] of Object.entries(this.docs.models)) {
      models[name] = {
        collection: model.collection,
        fields: Object.entries(model.fields).map(([fieldName, field]) => ({
          name: fieldName,
          type: field.type,
          operations: field.operations,
          default: field.defaultValue,
          required: field.operations.includes('c') && fieldName !== '_id'
        }))
      };
    }
    
    return models;
  }

  getCommonPatterns() {
    return {
      authentication: {
        login: `
// Login a user
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token } = await response.json();`,
        
        register: `
// Register a new user
const response = await fetch('/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, name })
});
const { user, token } = await response.json();`
      },
      
      crud_operations: {
        create: `API.DB.ModelName.create({ values: { field1: 'value1' } })`,
        read: `API.DB.ModelName.read({ where: { _id: 'id' } })`,
        update: `API.DB.ModelName.update({ where: { _id: 'id' }, values: { field1: 'new' } })`,
        delete: `API.DB.ModelName.delete({ where: { _id: 'id' } })`
      },
      
      permissions: {
        user_owns_resource: `"@resource.user_id=@req_user._id"`,
        user_has_role: `"admin=in=@req_user.roles"`,
        complex_permission: `{ "or": ["@resource.public=true", "@resource.user_id=@req_user._id"] }`
      }
    };
  }

  getExampleValue(type) {
    const examples = {
      'String': '"example string"',
      'Number': '123',
      'Boolean': 'true',
      'Date': '"2024-01-15T12:00:00Z"',
      'ObjectId': '"507f1f77bcf86cd799439011"',
      'Array': '[]',
      'Object': '{}'
    };
    
    return examples[type] || 'null';
  }

  /**
   * Helper method to find files matching a pattern
   */
  findFiles(dir, pattern) {
    // Simple file finder - in production would use glob
    const files = [];
    
    const walk = (currentDir) => {
      try {
        const items = fs.readdirSync(currentDir);
        
        items.forEach(item => {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            walk(fullPath);
          } else if (stat.isFile() && item.endsWith('.test.js')) {
            files.push(fullPath);
          }
        });
      } catch (error) {
        // Skip directories we can't read
      }
    };
    
    walk(dir);
    return files;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new CoreDocGenerator();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'generate':
    case undefined:
      generator.generate();
      break;
    
    case 'routes':
      generator.extractRoutesFromCode().then(() => {
        generator.generateRoutesMarkdown();
      });
      break;
    
    case 'models':
      generator.extractModelsFromCode().then(() => {
        generator.generateModelsMarkdown();
      });
      break;
    
    case 'config':
      generator.extractConfigSchema().then(() => {
        generator.generateConfigMarkdown();
      });
      break;
    
    case 'llm':
      generator.generate().then(() => {
        console.log('\n📍 LLM reference generated at: docs/llm-reference.json');
      });
      break;
    
    default:
      console.log(`
Basefloor Documentation Generator

Usage:
  node generate-docs.js [command]

Commands:
  generate  - Generate all documentation (default)
  routes    - Generate only routes documentation
  models    - Generate only models documentation
  config    - Generate only configuration documentation
  llm       - Generate only LLM reference file

Examples:
  node generate-docs.js
  node generate-docs.js routes
  node generate-docs.js llm
`);
  }
}

export default CoreDocGenerator;