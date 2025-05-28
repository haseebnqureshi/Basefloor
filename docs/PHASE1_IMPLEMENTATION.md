# Phase 1 Implementation: Core Documentation Generation Pipeline

## Overview

Phase 1 of the Basefloor documentation enhancement roadmap has been successfully implemented. This phase focused on creating an automated documentation generation pipeline that extracts information from code and generates both human-readable markdown and LLM-optimized JSON.

## What Was Built

### 1. Core Documentation Generator (`docs/scripts/generate-docs.js`)

A comprehensive ES module that:
- Extracts route definitions from configuration files
- Parses model schemas from both API code and config files
- Generates individual markdown files for each route and model
- Creates an LLM-optimized JSON reference file
- Supports incremental generation (routes only, models only, etc.)

### 2. Sample Configuration (`docs/scripts/sample-config.js`)

A fully-featured example configuration demonstrating:
- Multiple models (Users, Posts, Comments) with relationships
- Complex route patterns including nested routes
- Permission rules using Basefloor's DSL
- Filters for data scoping

### 3. Generated Documentation Structure

```
docs/
├── api/
│   ├── routes/
│   │   ├── index.md              # Routes overview
│   │   ├── users-create.md       # Individual route docs
│   │   ├── users-read.md
│   │   └── ...
│   └── models/
│       ├── index.md              # Models overview
│       ├── users.md              # Individual model docs
│       ├── posts.md
│       └── ...
├── guide/
│   └── configuration.md          # Auto-generated config docs
└── llm-reference.json           # LLM-optimized reference
```

## Key Features Implemented

### 1. Intelligent Route Parsing
- Extracts CRUD operations (c, rA, r, u, d) from config
- Parses complex permission rules including:
  - Boolean permissions (`allow: true/false`)
  - String permissions (`allow: "@user._id=@req_user._id"`)
  - Complex permissions with AND/OR logic
- Handles nested routes (e.g., `/posts/:id/comments`)
- Extracts filters for data scoping

### 2. Model Schema Extraction
- Parses the built-in Files model from API code
- Extracts custom models from configuration
- Identifies field types, operations, and defaults
- Handles model filters and transformations

### 3. LLM Reference Generation
The `llm-reference.json` includes:
- Current Basefloor version
- Quick start guide with minimal config
- Structured route and model data
- Common implementation patterns
- Configuration schema

### 4. Automated Documentation Features
- Determines authentication requirements from permissions
- Generates request/response examples
- Creates code snippets in multiple styles
- Adds timestamps for documentation freshness

## Usage

### Generate All Documentation
```bash
npm run docs:generate
```

### Generate Specific Parts
```bash
npm run docs:routes    # Routes only
npm run docs:models    # Models only  
npm run docs:config    # Configuration only
npm run docs:llm       # LLM reference only
```

### Direct Script Usage
```bash
node scripts/generate-docs.js [command]
```

## Implementation Details

### Route Extraction Algorithm
1. Parses configuration file to find routes object
2. Uses regex to match route patterns with proper brace balancing
3. Extracts CRUD operations and their configurations
4. Builds complete endpoint URLs based on operation type

### Model Parsing Strategy
1. Extracts built-in models from `packages/api/models/index.js`
2. Parses custom models from configuration
3. Identifies field metadata (type, operations, defaults)
4. Preserves model relationships and filters

### Permission Analysis
The generator analyzes permissions to determine:
- Authentication requirements
- User ownership rules
- Role-based access control
- Complex conditional logic

## Next Steps

With Phase 1 complete, the foundation is ready for:

### Phase 2: Custom VitePress Components
- Config Builder component for visual configuration
- API Explorer for testing endpoints
- Interactive code examples

### Phase 3: Self-Documenting Configuration
- Schema validation
- Auto-completion support
- Environment variable documentation

### Phase 4: Test-Based Examples
- Extract real examples from test files
- Validate examples against actual API

### Phase 5: CI/CD Integration
- GitHub Actions workflow
- Documentation drift detection
- Automated updates

## Technical Decisions

### ES Modules
The generator uses ES modules to align with the VitePress documentation setup.

### Regex-Based Parsing
While AST parsing would be more robust, regex provides sufficient accuracy for the well-structured Basefloor configuration format.

### Incremental Generation
Supporting partial generation allows faster iteration during development and reduces CI/CD build times.

## Known Limitations

1. **Complex Permission Objects**: Very complex nested permission objects may not be fully parsed
2. **Dynamic Routes**: Routes generated programmatically won't be detected
3. **Custom Filters**: Model filters defined as functions are noted but not fully documented

## Conclusion

Phase 1 successfully establishes the core documentation generation pipeline. The system can now automatically extract and document Basefloor APIs, providing both human-readable documentation and LLM-optimized references. This foundation enables the more advanced features planned for subsequent phases. 