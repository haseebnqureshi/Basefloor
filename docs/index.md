---
layout: default
title: MinAPI Documentation
---

# MinAPI Documentation

MinAPI is a comprehensive API framework built on Express and MongoDB that provides a minimum viable API setup with built-in authentication, permissions, CRUD operations, and resource management.

## What is MinAPI?

MinAPI is designed to be a powerful yet minimal API framework that handles all the common requirements of a modern API, allowing developers to focus on building their application's unique features rather than reinventing the wheel for standard API functionality.

## Key Features

- 🔐 **Authentication & Authorization**: Built-in JWT-based authentication, permissions, and user management
- 📊 **Data Modeling**: Flexible MongoDB integration with automatic CRUD operations
- 🛣️ **Routing**: Hierarchical routing with automatic parameter extraction and permission checks
- 📁 **File Management**: Integrated file upload, storage, and processing capabilities
- 📧 **Email Notifications**: Easy email integration through various providers
- 🎙️ **Audio Transcription**: Speech-to-text capabilities using Google Cloud
- 🤖 **AI Integration**: Support for AI services through Anthropic Claude and other providers
- 🔄 **File Conversions**: Built-in document and file format conversion

## Quick Links

- [Getting Started](./guides/getting-started.md): Set up your first MinAPI project
- [Configuration](./guides/configuration.md): Comprehensive configuration guide
- [Models](./reference/models.md): Database modeling and operations
- [Routes](./reference/routes.md): API endpoint definitions and permissions
- [Authentication](./reference/authentication.md): User authentication and security
- [Files](./reference/files.md): File handling, storage, and conversions
- [Examples](./examples/basic-setup.md): Example configurations and use cases

## Installation

```bash
npm install @hq/minapi
# or
yarn add @hq/minapi
```

## Basic Usage

```javascript
// Create minapi.config.js
module.exports = (API) => {
  return {
    project: {
      name: 'my-api',
      port: process.env.PORT || 3000,
      env: process.env.NODE_ENV || 'development'
    },
    db: '@mongodb/db',
    providers: {
      '@mongodb/db': {
        host: process.env.MONGODB_HOST,
        database: process.env.MONGODB_DATABASE
      }
    },
    // Add your models, routes, and other configuration here
  }
}

// Create index.js
const MinAPI = require('@hq/minapi')
const path = require('path')

const api = MinAPI({
  projectPath: __dirname,
  envPath: path.resolve(__dirname, '.env')
})

api.Init()
api.Start()
``` 