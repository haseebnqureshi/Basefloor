# Basefloor

> Modern full-stack development platform with unified configuration

Basefloor is a comprehensive ecosystem for building full-stack applications with Vue.js and Node.js. It provides a backend API framework and frontend component library that work seamlessly together through a unified configuration system.

## 🏗️ Architecture

Basefloor consists of three main packages:

- **[@basefloor/api](./packages/api)** - Backend API framework with authentication, permissions, and MongoDB integration
- **[@basefloor/app](./packages/app)** - Vue.js frontend framework with pre-built components and utilities  
- **[@basefloor/shared](./packages/shared)** - Common types, schemas, and utilities

## 🚀 Quick Start

### 1. Install packages

```bash
# For backend API
npm install @basefloor/api

# For frontend app (coming soon)
npm install @basefloor/app

# For shared utilities
npm install @basefloor/shared
```

### 2. Create unified configuration

Create a `basefloor.config.js` file:

```javascript
module.exports = (API) => ({
  project: {
    name: 'My App',
    port: 3000
  },
  
  database: {
    uri: 'mongodb://localhost:27017/myapp'
  },
  
  // API configuration
  api: {
    models: (m) => [
      m.create('Users', {
        fields: {
          name: { type: 'string', required: true },
          email: { type: 'string', required: true, unique: true }
        }
      })
    ],
    routes: (r) => [
      r.post('/users(Users)', { c: true }),
      r.get('/users(Users)', { rA: true })
    ]
  },
  
  // App configuration (coming soon)
  app: {
    theme: {
      primary: '#3B82F6',
      mode: 'light'
    }
  }
})
```

### 3. Set up your backend

```javascript
// server.js
const BasefloorAPI = require('@basefloor/api')

const api = BasefloorAPI({
  config: require('./basefloor.config.js')
})
```

### 4. Set up your frontend

```javascript
// main.js (coming soon)
import { createApp } from 'vue'
import { createBasefloorApp } from '@basefloor/app'

const app = createApp(App)
app.use(createBasefloorApp({
  config: require('./basefloor.config.js')
}))
app.mount('#app')
```

## 📦 Packages

### BasefloorAPI

Complete backend framework with:
- ✅ Built-in authentication & permissions
- ✅ MongoDB integration with automatic CRUD
- ✅ **Smart Dependencies** - Only installs providers you configure
- ✅ File upload & processing
- ✅ Email services (SendGrid, Mailgun, Postmark)
- ✅ AI integration (OpenAI, Anthropic, Google)
- ✅ Audio transcription
- ✅ Express.js foundation

**🚀 Dynamic Provider Installation**: BasefloorAPI automatically installs only the packages for services you actually configure, keeping your project lightweight and secure.

### BasefloorApp (Coming Soon)

Vue.js frontend framework with:
- 🔄 Pre-built UI components
- 🔄 API integration helpers
- 🔄 Theming system
- 🔄 Routing utilities
- 🔄 State management
- 🔄 TypeScript support

### Shared

Common utilities with:
- ✅ TypeScript type definitions
- ✅ Configuration schemas
- ✅ Validation utilities
- ✅ Shared constants

## 🛠️ Development

This is a monorepo managed with npm workspaces:

```bash
# Install all dependencies
npm install

# Run API in development mode
npm run api:dev

# Run documentation site
npm run docs:dev

# Run both API and docs
npm run dev

# Run tests for all packages
npm run test:all

# Build all packages
npm run build:all
```

## 📚 Documentation

Visit [basefloor.dev](https://basefloor.dev) for complete documentation.

## 🤝 Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

## 📄 License

MIT © [Haseeb Qureshi (HQ)](https://github.com/haseebnqureshi)

## 🔗 Links

- [Documentation](https://basefloor.dev)
- [GitHub](https://github.com/haseebnqureshi/basefloor)
- [NPM - BasefloorAPI](https://npmjs.com/package/@basefloor/api)
- [NPM - BasefloorApp](https://npmjs.com/package/@basefloor/app) (coming soon)

## Features

### Backend (API)
- 🔐 Built-in Authentication & JWT
- 👥 User Management & Permissions
- 📝 CRUD Operations
- 📨 Email Notifications (Postmark integration)
- 🗄️ MongoDB Integration
- 🖼️ File Management & Image Processing
- 🎙️ Audio-to-Text Transcription
- 🔄 File Format Conversions
- 🔒 Security Features
- 📱 Phone Number Validation
- ☁️ AWS S3 Integration

### Frontend (App)
- Beautiful UI components
- Form elements and validation
- Data visualization
- Authentication flows
- Rich text editing
- And more...

## Installation

### Using both backend and frontend
```bash
npm install basefloor
```

### Using just the backend
```bash
npm install basefloor-api
```

### Using just the frontend
```bash
npm install basefloor-app
```

### System Requirements for API Features

The following system dependencies are required for certain API features:

#### LibreOffice (for document processing and text-to-image conversion)
```bash
# Ubuntu
sudo apt install libreoffice

# Mac
brew install libreoffice
```

#### Ghostscript (for PDF processing)
```bash
# Mac
brew install ghostscript

# Ubuntu
sudo apt-get install ghostscript
```

#### Google Cloud SDK (for audio transcription)
To use the audio transcription features, you'll need Google Cloud credentials:

1. Create a Google Cloud project and enable the Speech-to-Text API
2. Create a service account with access to the Speech-to-Text API
3. Download the service account key file (JSON)

## Getting Started

### Creating an API Server

1. Create a new project folder and initialize:
```bash
mkdir my-api-project
cd my-api-project
npm init -y
npm install basefloor
```

2. Create a `basefloor.config.js` file:
```javascript
module.exports = (API) => {
  return {
    project: {
      name: 'My API',
      port: process.env.PORT || 3000,
      env: process.env.NODE_ENV || 'development',
      checks: true // Enable checks/validation
    },
    
    // Database configuration
    db: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp',
      database: process.env.MONGODB_DATABASE || 'myapp'
    },
    
    // Authentication configuration
    auth: {
      enabled: true,
      jwt: {
        secret: process.env.JWT_SECRET,
        expirations: {
          auth: '7d',
          verify: '24h',
          reset: '1h'
        }
      }
    },
    
    // Define your models
    models: [
      {
        _name: 'user',
        _label: 'Users',
        _collection: 'users',
        _values: {
          email: ['string', 'c,r,u'],
          password: ['string', 'c'],
          name: ['string', 'c,r,u']
        }
      }
    ],
    
    // Define your API routes
    routes: () => [
      {
        _id: '/users(user)',
        _create: { allow: true },
        _read: { allow: true, where: '_id' },
        _update: { allow: '@_user._id=@user._id' },
        _delete: { allow: false }
      }
    ]
  };
};
```

3. Create an `index.js` file:
```javascript
// Import the Basefloor API
const { api } = require('basefloor');
// OR if you're only using the API package
// const api = require('basefloor-api');

// Initialize the API with the project path
const API = api({
  projectPath: __dirname,
  envPath: './.env' // Optional: path to your .env file
});

// Initialize all components based on your config
API.Init();

// Start the server
API.Start();
```

4. Start your API server:
```bash
node index.js
```

### Using the API Object

The API object provides access to all Basefloor functionality:

```javascript
// Access database utilities
API.DB.connect();
API.DB.getCollection('users');

// Use authentication functions
API.Auth.createUser({ email, password });
API.Auth.generateToken(user);

// File operations
API.Files.upload(req.files.document);
API.Files.convertFile({ inType: '.docx', outType: '.pdf', inPath, outPath });

// Email sending
API.Emails.send('welcome', { to: user.email, data: { name: user.name } });

// AI capabilities
const completion = await API.AI.complete("Summarize this text: " + text);

// Transcription
const text = await API.Transcription.processAudio(audioFilePath);

// Access utilities
API.Utils.validator.isEmail(email);
API.Utils.formatter.phone(phoneNumber);
```

## Backend Usage

```javascript
const basefloor = require('basefloor');
// OR
const { api } = require('basefloor');
// OR
const api = require('basefloor-api');

// Initialize your API
const app = api.init({
  db: {
    uri: 'mongodb://localhost:27017/myapp'
  },
  auth: {
    secret: 'your-jwt-secret'
  }
});

// Define models
api.model('User', {
  name: String,
  email: String,
  password: String
});

// Start server
app.listen(3000, () => {
  console.log('API server running on port 3000');
});
```

### API Configuration

For detailed API configuration, create a `basefloor.config.js` file in your project root:

```javascript
module.exports = (API) => {
  return {
    // API Name
    name: 'Your API Name',

    // Authentication Configuration
    auth: {
      // JWT configuration
      jwt: {
        expirations: {
          auth: '7d',    // Authentication token expiration
          verify: '24h', // Verification token expiration
          reset: '1h'    // Password reset token expiration
        }
      }
    },

    // Database Models Configuration
    models: [
      {
        _name: 'user',           // Model name
        _label: 'Users',         // Display label
        _collection: 'users',    // MongoDB collection name
        _values: {
          // Define model fields with their types and CRUD permissions
          email: ['string', 'c,r,u'],
          password_hash: ['string', 'c,r'],
          email_verified: ['boolean', 'c,r,u'],
          created_at: ['date', 'r'],
          updated_at: ['date', 'r']
        }
      }
    ],

    // Routes Configuration
    routes: () => [
      {
        _id: '/users(user)',  // Route pattern
        _create: {
          allow: true         // Permission rules
        },
        _read: {
          allow: true,
          where: '_id'        // URL parameter mapping
        },
        _update: {
          allow: '@_user._id=@user._id'  // Permission rule example
        },
        _delete: {
          allow: false
        }
      }
    ],

    // Other configurations as needed
  }
}
```

## Frontend Usage

### Nuxt Module

In your `nuxt.config.ts`:

```javascript
export default defineNuxtConfig({
  modules: ['basefloor/app'],
  
  basefloor: {
    apiUrl: 'http://localhost:3000'
  }
})
```

### Using Components

```vue
<template>
  <div>
    <BasefloorButton @click="login">Login</BasefloorButton>
    <BasefloorDataTable :data="users" />
  </div>
</template>

<script setup>
const users = ref([]);

// Use the basefloor stores
const authStore = useBasefloorAuthStore();

async function login() {
  await authStore.login(email, password);
}
</script>
```

## API Features in Detail

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Two-factor authentication support
- Password reset functionality
- Email verification

### File Management
- Image processing with Sharp
- AWS S3 integration for file storage
- Document processing capabilities
- Text-to-image conversion
- Audio transcription to text

### File Conversion Capabilities

Basefloor provides robust file conversion capabilities:

| From | To | Provider |
|------|-----|---------|
| Documents (.doc, .docx, etc.) | PDF | LibreOffice |
| PDF | PNG images | Sharp |
| Images | Optimized PNG | Sharp |
| Audio files (.mp3, .wav, etc.) | Text (.txt) | Google Transcription |
| Text (.txt) | Image (.png) | LibreOffice |

## Documentation

For more detailed documentation, check out:
- [API Documentation](./api/README.md) - Comprehensive API reference, configuration, and examples
- [App Components Documentation](./app/README.md) - Frontend components and usage

## License

MIT © [Haseeb Qureshi (HQ)](https://github.com/avenuedigital/Basefloor)

## Support

For issues and feature requests, please use the [GitHub issues page](https://github.com/avenuedigital/Basefloor/issues). 