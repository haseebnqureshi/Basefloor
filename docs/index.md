---
layout: home

hero:
  name: "BasefloorAPI"
  text: "Modern Backend Framework"
  tagline: "Build powerful APIs with built-in authentication, permissions, and MongoDB integration"
  actions:
    - theme: brand
      text: Get Started
      link: /reference/guide/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/haseebnqureshi/basefloor
---

<!-- Custom Home Page Cards -->
<style>
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}
.card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 1rem;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: all 0.3s ease;
}
.card:hover {
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vp-c-text-1);
}
.card-desc {
  margin-bottom: 1rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.card-code {
  background: var(--vp-code-block-bg);
  color: var(--vp-code-block-color);
  border: 1px solid var(--vp-c-border-soft);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-family: var(--vp-font-family-mono);
  overflow-x: auto;
  margin-bottom: 1rem;
  width: 100%;
  position: relative;
  padding-left: 3rem;
  line-height: 1.4;
}
.card-code::before {
  content: attr(data-line-numbers);
  position: absolute;
  left: 0;
  top: 0.75rem;
  padding: 0 0.5rem;
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
  line-height: 1.4;
  border-right: 1px solid var(--vp-c-border-soft);
  width: 2rem;
  text-align: right;
  user-select: none;
  white-space: pre;
}
.card-cta {
  color: var(--vp-c-brand-1);
  text-decoration: none !important;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: auto;
  transition: color 0.2s;
}
.card-cta:hover {
  color: var(--vp-c-brand-2);
}
.card-cta::after {
  content: "→";
  font-size: 1rem;
}

/* Dark theme specific adjustments */
html.dark .card {
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.3);
}
html.dark .card:hover {
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.4);
}
</style>

<div class="cards-grid">

  <div class="card">
    <div class="card-title">🚀 Quick Setup</div>
    <div class="card-desc">Get a full-featured API running in minutes with minimal configuration.</div>
    <div class="card-code" data-line-numbers="1">BasefloorAPI({ config })</div>
    <a href="/reference/guide/quick-start" class="card-cta">Get started</a>
  </div>

  <div class="card">
    <div class="card-title">🔐 Built-in Authentication</div>
    <div class="card-desc">JWT-based auth with user registration, login, and permission management.</div>
    <div class="card-code" data-line-numbers="1
2
3">r.post('/auth/register', { auth: false })<br>r.post('/auth/login', { auth: false })<br>r.get('/profile', { permissions: ['auth'] })</div>
    <a href="/reference/authentication" class="card-cta">View auth docs</a>
  </div>

  <div class="card">
    <div class="card-title">📊 MongoDB Integration</div>
    <div class="card-desc">Seamless MongoDB integration with built-in CRUD operations and data modeling.</div>
    <div class="card-code" data-line-numbers="1">r.post('/users(Users)', { c: true })</div>
    <a href="/reference/models" class="card-cta">Learn about models</a>
  </div>

  <div class="card">
    <div class="card-title">📁 File Management</div>
    <div class="card-desc">Upload, process, and serve files with support for multiple storage providers.</div>
    <div class="card-code" data-line-numbers="1">files: { provider: 'local' }</div>
    <a href="/reference/files" class="card-cta">File handling docs</a>
  </div>

  <div class="card">
    <div class="card-title">🤖 AI Integration</div>
    <div class="card-desc">Built-in support for AI services including OpenAI, Anthropic, and Google AI.</div>
    <div class="card-code" data-line-numbers="1">ai: { openai: { apiKey }, anthropic: { apiKey } }</div>
    <a href="/reference/ai" class="card-cta">AI integration guide</a>
  </div>

  <div class="card">
    <div class="card-title">📧 Email Services</div>
    <div class="card-desc">Send emails with multiple provider support and template systems.</div>
    <div class="card-code" data-line-numbers="1">email: { provider: 'sendgrid' }</div>
    <a href="/reference/emails" class="card-cta">Email setup guide</a>
  </div>

  <div class="card">
    <div class="card-title">🎤 Audio Transcription</div>
    <div class="card-desc">Speech-to-text capabilities with Google Cloud Speech integration.</div>
    <div class="card-code" data-line-numbers="1">audio: { provider: 'google' }</div>
    <a href="/reference/transcription" class="card-cta">Audio transcription</a>
  </div>

  <div class="card">
    <div class="card-title">📄 Document Processing</div>
    <div class="card-desc">Convert and process documents between different formats.</div>
    <div class="card-code" data-line-numbers="1">POST /files/:id/convert</div>
    <a href="/reference/documents" class="card-cta">Document processing</a>
  </div>

  <div class="card">
    <div class="card-title">⚡ Express-based</div>
    <div class="card-desc">Built on top of Express.js for maximum flexibility and performance.</div>
    <div class="card-code" data-line-numbers="1
2">API.use()<br>API.get()</div>
    <a href="/reference/express" class="card-cta">Express features</a>
  </div>

  <div class="card">
    <div class="card-title">🛡️ Type Safety</div>
    <div class="card-desc">Full TypeScript support with comprehensive type definitions.</div>
    <div class="card-code" data-line-numbers="1">import { BasefloorAPI } from '@basefloor/api'</div>
    <a href="/reference/typescript" class="card-cta">TypeScript guide</a>
  </div>

  <div class="card">
    <div class="card-title">🔧 Highly Configurable</div>
    <div class="card-desc">Customize every aspect through a simple configuration file.</div>
    <div class="card-code" data-line-numbers="1">basefloor.config.js</div>
    <a href="/reference/guide/configuration" class="card-cta">Configuration docs</a>
  </div>

  <div class="card">
    <div class="card-title">📚 Well Documented</div>
    <div class="card-desc">Comprehensive documentation with examples and best practices for every feature.</div>
    <div class="card-code" data-line-numbers="1">// See docs for every feature!</div>
    <a href="/reference/" class="card-cta">Browse all docs</a>
  </div>

</div>

<script>
// Auto-generate line numbers for code blocks
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    const codeBlocks = document.querySelectorAll('.card-code');
    codeBlocks.forEach(block => {
      const lines = block.innerHTML.split('<br>').length;
      const lineNumbers = Array.from({length: lines}, (_, i) => i + 1).join('\n');
      block.setAttribute('data-line-numbers', lineNumbers);
    });
  });
}
</script>

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