# Basefloor Shared

Common types, schemas, and utilities for the Basefloor ecosystem.

## Installation

```bash
npm install @basefloor/shared
```

## Usage

### Configuration Types

```typescript
import type { BasefloorConfig, ApiConfig, AppConfig } from '@basefloor/shared'

const config: BasefloorConfig = {
  project: {
    name: 'My App',
    port: 3000
  },
  api: {
    // API-specific configuration
  },
  app: {
    // App-specific configuration
  }
}
```

### Validation Schemas

```typescript
import { configSchema } from '@basefloor/shared'

// Validate configuration
const result = configSchema.safeParse(userConfig)
if (result.success) {
  // Configuration is valid
  console.log(result.data)
} else {
  // Handle validation errors
  console.error(result.error.issues)
}
```

## Features

- 📝 **TypeScript Types** - Complete type definitions for the ecosystem
- ✅ **Validation Schemas** - Zod schemas for configuration validation
- 🔧 **Utilities** - Common utility functions
- 🔒 **Type Safety** - Ensures consistency across packages

## Documentation

For detailed documentation, visit [basefloor.dev](https://basefloor.dev)

## License

MIT © BasefloorAPI 