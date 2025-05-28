# Basefloor Documentation Enhancement Roadmap

## Overview

This document outlines the comprehensive strategy for enhancing Basefloor's documentation to serve both human developers on our website and Large Language Models (LLMs) for accurate implementation guidance. The approach focuses on automated generation, interactive components, and maintaining synchronization between code and documentation.

## Goals

1. **Automated Documentation Generation** - Documentation that writes itself from code
2. **Interactive Learning Experience** - Custom VitePress components for hands-on exploration
3. **LLM Optimization** - Structured data and clear patterns for AI comprehension
4. **Continuous Accuracy** - CI/CD integration to prevent documentation drift
5. **Developer Experience** - Reduce time-to-first-success for new users

## High-Priority Implementation Plan

### Phase 1: Core Documentation Generation Pipeline (Weeks 1-2)

#### 1.1 Documentation Generator Script
Create `docs/scripts/generate-docs.js`:

```javascript
// Core documentation generator that extracts from code
class CoreDocGenerator {
  async generate() {
    const docs = {
      routes: await this.extractRoutesFromCode(),
      models: await this.extractModelsFromCode(),
      config: await this.extractConfigSchema()
    };
    
    await this.generateMarkdownFiles(docs);
    await this.generateLLMReference(docs);
  }
}
```

**Key Features:**
- Parse `packages/api/routes/index.js` for route definitions
- Extract model schemas from `packages/api/models/index.js`
- Generate clean markdown for VitePress
- Create `docs/llm-reference.json` for AI consumption

#### 1.2 JSDoc Annotations
Add structured documentation directly in code:

```javascript
/**
 * Create a new user
 * @route POST /users
 * @auth required
 * @permissions none
 * @body {Object} userData - User information
 * @body {string} userData.email - Email address
 * @body {string} userData.password - Password (min 8 chars)
 * @returns {Object} 201 - User created successfully
 * @returns {Error} 400 - Validation error
 * @example request
 * {
 *   "email": "user@example.com",
 *   "password": "securePass123"
 * }
 * @example response
 * {
 *   "user": { "_id": "123", "email": "user@example.com" },
 *   "token": "jwt-token"
 * }
 */
```

### Phase 2: Custom VitePress Components (Weeks 2-3)

#### 2.1 Config Builder Component
**File:** `docs/.vitepress/theme/components/ConfigBuilder.vue`

**Purpose:** Visual builder for `basefloor.config.js`

**Features:**
- Drag-and-drop model creation
- Visual route configuration
- Real-time config preview
- Export to clipboard/file

**Value:** Reduces configuration time from hours to minutes

#### 2.2 API Explorer Component
**File:** `docs/.vitepress/theme/components/APIExplorer.vue`

**Purpose:** Test API endpoints directly in documentation

**Features:**
- Live API testing
- Editable parameters and body
- Response visualization
- Authentication token management

**Value:** Eliminates need for external API testing tools

#### 2.3 Code Example Component
**File:** `docs/.vitepress/theme/components/CodeExample.vue`

**Purpose:** Multi-variant code examples with smart features

**Features:**
- Language/framework switching
- Copy with framework context
- Inline explanations
- Test status indicators

### Phase 3: Self-Documenting Configuration (Week 3)

#### 3.1 Config Schema Definition
Create `packages/api/config-schema.js`:

```javascript
module.exports = {
  database: {
    type: 'object',
    required: true,
    description: 'MongoDB connection settings',
    properties: {
      uri: {
        type: 'string',
        required: true,
        description: 'MongoDB connection URI',
        example: 'mongodb://localhost:27017/myapp',
        env: 'MONGODB_URI'
      }
    }
  }
  // ... rest of schema
};
```

#### 3.2 Auto-generated Config Documentation
- Parse schema to generate markdown
- Include examples and environment variables
- Show required vs optional fields
- Link to related documentation

### Phase 4: Test-Based Examples (Week 4)

#### 4.1 Example Extraction Script
Create `docs/scripts/extract-test-examples.js`:

```javascript
async function extractTestExamples() {
  const testFiles = glob.sync('packages/api/**/*.test.js');
  const examples = [];
  
  for (const file of testFiles) {
    // Extract real API calls from tests
    // Clean up for documentation use
    // Verify they actually pass
  }
  
  return examples;
}
```

#### 4.2 LLM Reference File
Generate `docs/llm-reference.json`:

```json
{
  "basefloor_version": "1.1.2",
  "last_updated": "2024-01-15",
  "quick_start": {
    "install": "npm install @basefloor/api",
    "minimal_config": "...",
    "run": "node index.js"
  },
  "routes": [...],
  "models": [...],
  "common_patterns": {...}
}
```

### Phase 5: CI/CD Integration (Week 5)

#### 5.1 Documentation Check Workflow
Create `.github/workflows/docs-check.yml`:

```yaml
name: Documentation Check
on: [push, pull_request]
jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate docs
        run: npm run docs:generate
      - name: Check if docs are up to date
        run: |
          if [[ `git status --porcelain docs/` ]]; then
            echo "Documentation is outdated. Run 'npm run docs:generate'"
            exit 1
          fi
```

## Additional VitePress Components (Lower Priority)

### Permission Visualizer Component
**Purpose:** Make complex permissions understandable through visual flow diagrams

### Model Relationship Diagram
**Purpose:** Auto-generate ER-style diagrams from model definitions

## Technical Implementation Details

### Documentation Generation Pipeline

1. **Source Files to Monitor:**
   - `packages/api/routes/index.js`
   - `packages/api/models/index.js`
   - `packages/api/**/*.test.js`
   - `basefloor.config.js`

2. **Generated Documentation Structure:**
   ```
   docs/
   ├── api/
   │   ├── routes/
   │   │   ├── auth-register.md
   │   │   ├── auth-login.md
   │   │   └── ...
   │   ├── models/
   │   │   ├── users.md
   │   │   └── ...
   │   └── index.md
   ├── guide/
   │   ├── configuration.md (auto-generated sections)
   │   └── ...
   ├── reference/
   │   └── ...
   └── llm-reference.json
   ```

3. **VitePress Configuration Updates:**
   - Add custom components to theme
   - Configure plugins for documentation generation
   - Set up build-time documentation validation

### Component Development Guidelines

1. **Consistency:**
   - Use Basefloor's color scheme
   - Follow VitePress component patterns
   - Ensure mobile responsiveness

2. **Performance:**
   - Lazy load heavy components (Monaco Editor)
   - Use virtual scrolling for large lists
   - Cache API responses in examples

3. **Accessibility:**
   - ARIA labels for interactive elements
   - Keyboard navigation support
   - Screen reader friendly

### LLM Optimization Strategies

1. **Structured Data:**
   - Hidden JSON-LD blocks in markdown
   - Consistent naming conventions
   - Clear input/output examples

2. **Pattern Library:**
   - Common implementation patterns
   - Error handling examples
   - Best practices sections

3. **Versioning:**
   - Version tags in documentation
   - Migration guides between versions
   - Deprecation notices

## Success Metrics

1. **Documentation Coverage:**
   - 100% of API endpoints documented
   - 100% of models documented
   - 80%+ JSDoc coverage

2. **User Experience:**
   - Time to first successful API call < 5 minutes
   - Support ticket reduction by 50%
   - Documentation satisfaction score > 4.5/5

3. **Technical Metrics:**
   - Documentation build time < 30 seconds
   - Zero documentation drift (CI/CD enforced)
   - LLM implementation success rate > 90%

## Maintenance Plan

1. **Weekly:**
   - Review documentation coverage reports
   - Update examples from new tests
   - Address any CI/CD failures

2. **Monthly:**
   - Review and update interactive components
   - Analyze user feedback and usage metrics
   - Update LLM training data

3. **Quarterly:**
   - Major documentation structure reviews
   - Component performance optimization
   - New feature documentation planning

## Resources and References

- [VitePress Documentation](https://vitepress.dev/)
- [JSDoc Reference](https://jsdoc.app/)
- [Monaco Editor Integration](https://microsoft.github.io/monaco-editor/)
- [Basefloor GitHub Repository](https://github.com/haseebnqureshi/basefloor)

## Next Steps

1. **Week 1:** Set up core documentation generator
2. **Week 2:** Implement Config Builder component
3. **Week 3:** Add API Explorer component
4. **Week 4:** Extract test examples and create LLM reference
5. **Week 5:** Set up CI/CD pipeline

This roadmap will be referenced and updated throughout the implementation process. Each completed phase should be marked with implementation notes and any adjustments made during development.

---

*Last Updated: January 2024*
*Document Version: 1.0* 