---
layout: home

hero:
  name: "BasefloorAPI"
  text: "Modern Backend Framework"
  tagline: "Build powerful APIs with built-in authentication, permissions, and MongoDB integration"
  actions:
    - theme: brand
      text: Get Started
      link: /guide/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/haseebnqureshi/minAPI

features:
  - icon: 🚀
    title: Quick Setup
    details: Get a full-featured API running in minutes with minimal configuration
  - icon: 🔐
    title: Built-in Authentication
    details: JWT-based auth with user registration, login, and permission management
  - icon: 📊
    title: MongoDB Integration
    details: Seamless MongoDB integration with built-in CRUD operations and data modeling
  - icon: 📁
    title: File Management
    details: Upload, process, and serve files with support for multiple storage providers
  - icon: 🤖
    title: AI Integration
    details: Built-in support for AI services including OpenAI, Anthropic, and Google AI
  - icon: 📧
    title: Email Services
    details: Send emails with multiple provider support and template systems
  - icon: 🎤
    title: Audio Transcription
    details: Speech-to-text capabilities with Google Cloud Speech integration
  - icon: 📄
    title: Document Processing
    details: Convert and process documents between different formats
  - icon: ⚡
    title: Express-based
    details: Built on top of Express.js for maximum flexibility and performance
  - icon: 🛡️
    title: Type Safety
    details: Full TypeScript support with comprehensive type definitions
  - icon: 🔧
    title: Highly Configurable
    details: Customize every aspect through a simple configuration file
  - icon: 📚
    title: Well Documented
    details: Comprehensive documentation with examples and best practices
---

## Installation

::: code-group

```bash [npm]
npm install @basefloor/api
```

```bash [yarn]
yarn add @basefloor/api
```

:::

## Quick Start

```javascript
// Create basefloor.config.js
module.exports = (API) => ({
  project: {
    name: 'My API',
    port: 3000
  },
  database: {
    uri: 'mongodb://localhost:27017/myapp'
  },
  routes: (r) => [
    r.post('/users(Users)', { c: true }),
    r.get('/users(Users)', { rA: true }),
    r.get('/users/:user_id(Users)', { r: true })
  ]
})
```

```javascript
// server.js
const BasefloorAPI = require('@basefloor/api')

const api = BasefloorAPI({
  config: require('./basefloor.config.js')
})
```

## What is BasefloorAPI?

BasefloorAPI is the backend framework component of the **Basefloor ecosystem**. It's designed to be a powerful yet minimal API framework that handles all the common requirements of a modern API, allowing developers to focus on building their application's unique features rather than boilerplate code.

### The Basefloor Ecosystem

- **🏗️ BasefloorAPI** (this framework) - Backend API framework with authentication, database integration, and services
- **🎨 BasefloorApp** (coming soon) - Vue.js frontend framework with components and utilities
- **⚙️ Unified Config** - Single `basefloor.config.js` file configures both API and App

### With BasefloorAPI, you get:

- **Zero-config CRUD operations** - Define models and get full REST APIs automatically
- **Built-in authentication & permissions** - JWT-based auth with flexible permission rules  
- **File upload & processing** - Handle file uploads, conversions, and storage seamlessly
- **Email & notifications** - Send emails with multiple provider support
- **AI integration** - Built-in support for OpenAI, Anthropic, and other AI services
- **Database abstraction** - Work with MongoDB through a simple, powerful interface
- **Extensive customization** - Override and extend any part of the framework

Whether you're building a simple REST API or a complex application backend, BasefloorAPI provides the foundation you need to get started quickly and scale effectively. 