# TypeScript Support

BasefloorAPI provides comprehensive TypeScript support with full type definitions, making it easy to build type-safe APIs with excellent developer experience.

## Overview

BasefloorAPI is built with TypeScript and provides complete type definitions for all APIs, configuration options, and data models. This ensures type safety throughout your application and enables excellent IDE support with autocomplete and error checking.

## Installation

When you install BasefloorAPI, TypeScript definitions are included automatically:

```bash
npm install @basefloor/api
# TypeScript definitions are included
```

For development, you may also want to install TypeScript:

```bash
npm install -D typescript @types/node
```

## Basic Usage

Import BasefloorAPI with full type support:

```typescript
import { BasefloorAPI, BasefloorConfig } from '@basefloor/api'

// Configuration is fully typed
const config: BasefloorConfig = {
  project: {
    name: 'My API',
    port: 3000
  },
  database: {
    uri: 'mongodb://localhost:27017/myapp'
  },
  routes: (r) => [
    r.post('/users(Users)', { c: true }),
    r.get('/users(Users)', { rA: true })
  ]
}

const api = BasefloorAPI({ config })
```

## Type Definitions

### Configuration Types

The configuration object is fully typed with `BasefloorConfig`:

```typescript
interface BasefloorConfig {
  project: ProjectConfig
  database: DatabaseConfig
  auth?: AuthConfig
  files?: FilesConfig
  email?: EmailConfig
  ai?: AIConfig
  routes: (r: RouteBuilder) => Route[]
}

interface ProjectConfig {
  name: string
  port: number
  cors?: CorsConfig
  middleware?: MiddlewareConfig
}

interface DatabaseConfig {
  uri: string
  options?: MongoClientOptions
}
```

### Route Types

Routes are strongly typed with the `Route` interface:

```typescript
interface Route {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  handler?: RouteHandler
  middleware?: Middleware[]
  permissions?: string[]
  auth?: boolean
  // CRUD operation flags
  c?: boolean  // create
  r?: boolean  // read
  rA?: boolean // read all
  u?: boolean  // update
  d?: boolean  // delete
}

type RouteHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>
```

### Model Types

Define your models with TypeScript interfaces:

```typescript
interface User {
  _id?: string
  email: string
  password: string
  name: string
  role: 'user' | 'admin'
  createdAt?: Date
  updatedAt?: Date
}

interface Post {
  _id?: string
  title: string
  content: string
  author: string // User ID
  published: boolean
  tags: string[]
  createdAt?: Date
  updatedAt?: Date
}
```

## Advanced Usage

### Custom Route Handlers

Create type-safe custom route handlers:

```typescript
import { Request, Response, NextFunction } from 'express'
import { BasefloorAPI, RouteHandler } from '@basefloor/api'

const getUserProfile: RouteHandler = async (req, res, next) => {
  try {
    const userId = req.params.user_id
    const user = await req.API.models.Users.findById(userId)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({ user })
  } catch (error) {
    next(error)
  }
}

const config = {
  // ... other config
  routes: (r) => [
    r.get('/users/:user_id/profile', { 
      handler: getUserProfile,
      permissions: ['auth']
    })
  ]
}
```

### Type-Safe Model Operations

Work with models in a type-safe way:

```typescript
import { Model } from '@basefloor/api'

// Models are automatically typed based on your schema
const createUser = async (userData: Partial<User>): Promise<User> => {
  const user = await API.models.Users.create(userData)
  return user
}

const findUserByEmail = async (email: string): Promise<User | null> => {
  const user = await API.models.Users.findOne({ email })
  return user
}
```

### Service Types

BasefloorAPI services are fully typed:

```typescript
import { AIService, EmailService, FileService } from '@basefloor/api'

// AI Service
const generateText = async (prompt: string): Promise<string> => {
  const response = await API.services.ai.generate({
    provider: 'openai',
    model: 'gpt-4',
    prompt,
    maxTokens: 100
  })
  return response.text
}

// Email Service
const sendWelcomeEmail = async (userEmail: string, userName: string): Promise<void> => {
  await API.services.email.send({
    to: userEmail,
    subject: 'Welcome!',
    template: 'welcome',
    data: { name: userName }
  })
}
```

## Configuration with Types

### Environment-Specific Configuration

Use TypeScript to create environment-specific configurations:

```typescript
interface Environment {
  NODE_ENV: 'development' | 'production' | 'test'
  DATABASE_URI: string
  JWT_SECRET: string
  OPENAI_API_KEY?: string
}

const env: Environment = {
  NODE_ENV: process.env.NODE_ENV as Environment['NODE_ENV'] || 'development',
  DATABASE_URI: process.env.DATABASE_URI || 'mongodb://localhost:27017/myapp',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
}

const config: BasefloorConfig = {
  project: {
    name: 'My API',
    port: env.NODE_ENV === 'production' ? 8080 : 3000
  },
  database: {
    uri: env.DATABASE_URI
  },
  auth: {
    jwt: {
      secret: env.JWT_SECRET
    }
  },
  ai: env.OPENAI_API_KEY ? {
    openai: {
      apiKey: env.OPENAI_API_KEY
    }
  } : undefined
}
```

### Type Guards

Create type guards for runtime type checking:

```typescript
function isUser(obj: any): obj is User {
  return obj && 
    typeof obj.email === 'string' &&
    typeof obj.name === 'string' &&
    ['user', 'admin'].includes(obj.role)
}

const validateUserData: RouteHandler = (req, res, next) => {
  if (!isUser(req.body)) {
    return res.status(400).json({ error: 'Invalid user data' })
  }
  next()
}
```

## IDE Support

### VS Code

BasefloorAPI provides excellent VS Code support with:

- **IntelliSense** - Autocomplete for all APIs and configuration options
- **Type checking** - Real-time error detection
- **Go to definition** - Navigate to type definitions
- **Refactoring** - Safe renaming and refactoring

### Recommended Extensions

- **TypeScript Importer** - Auto-import TypeScript modules
- **Path Intellisense** - Autocomplete for file paths
- **ESLint** - Code linting with TypeScript support

## Best Practices

1. **Use strict TypeScript** - Enable strict mode in `tsconfig.json`
2. **Define interfaces** - Create interfaces for your data models
3. **Type your handlers** - Use proper types for route handlers
4. **Validate at runtime** - Use type guards for runtime validation
5. **Leverage generics** - Use generic types for reusable code

## Example tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

## Troubleshooting

### Common Type Issues

**Issue**: Type errors with model operations
```typescript
// ❌ This might cause type errors
const user = await API.models.Users.findById(id)

// ✅ Better approach with proper typing
const user: User | null = await API.models.Users.findById(id)
```

**Issue**: Configuration type errors
```typescript
// ❌ Missing required properties
const config = {
  project: { name: 'My API' } // Missing port
}

// ✅ Complete configuration
const config: BasefloorConfig = {
  project: { name: 'My API', port: 3000 },
  database: { uri: 'mongodb://localhost:27017/myapp' },
  routes: (r) => []
}
```

## Related

- [Configuration](/reference/guide/configuration) - Configuration options
- [Models](/reference/models) - Data modeling
- [Routes](/reference/routes) - Route definitions
- [API Reference](/api/routes/) - Complete API documentation 