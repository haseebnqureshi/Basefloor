---
layout: home

hero:
  name: "MinAPI"
  text: "Comprehensive API Framework"
  tagline: "Built on Express and MongoDB with authentication, permissions, CRUD operations, and resource management out of the box."
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View Examples
      link: /examples/

features:
  - icon: 🔐
    title: Authentication & Authorization
    details: Built-in JWT-based authentication, permissions, and user management system.
  
  - icon: 📊
    title: Data Modeling
    details: Flexible MongoDB integration with automatic CRUD operations and schema validation.
  
  - icon: 🛣️
    title: Smart Routing
    details: Hierarchical routing with automatic parameter extraction and permission checks.
  
  - icon: 📁
    title: File Management
    details: Integrated file upload, storage, and processing capabilities with multiple providers.
  
  - icon: 📧
    title: Email Notifications
    details: Easy email integration through various providers like SendGrid, Mailgun, and more.
  
  - icon: 🎙️
    title: Audio Transcription
    details: Speech-to-text capabilities using Google Cloud and other transcription services.
  
  - icon: 🤖
    title: AI Integration
    details: Support for AI services through Anthropic Claude and other providers.
  
  - icon: 🔄
    title: File Conversions
    details: Built-in document and file format conversion capabilities.
---

## What is MinAPI?

MinAPI is designed to be a powerful yet minimal API framework that handles all the common requirements of a modern API, allowing developers to focus on building their application's unique features rather than reinventing the wheel for standard API functionality.

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