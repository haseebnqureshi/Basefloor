# Interactive Tools

Welcome to the Basefloor interactive tools! These powerful utilities help you build, test, and understand Basefloor APIs without leaving the documentation.

> **💡 Environment Setup**
> 
> These tools work with both development (`http://localhost:3000`) and production (`https://api.yourdomain.com`) environments. Configure your base URL to match your setup.

## Available Tools

### 🔧 [Configuration Builder](/tools/config-builder)
Visual interface for creating Basefloor configuration files. Build your configuration step-by-step with validation and export functionality.

**Perfect for:**
- First-time setup
- Exploring configuration options
- Generating boilerplate configs
- Learning Basefloor structure

### 🚀 [API Explorer](/tools/api-explorer)
Live API testing interface that lets you make real HTTP requests directly from the documentation.

**Perfect for:**
- Testing endpoints
- Understanding request/response formats
- Debugging API calls
- Prototyping integrations

### 💻 [Code Playground](/tools/code-playground)
Multi-language code examples with live execution and copy-paste ready snippets.

**Perfect for:**
- Learning by example
- Quick reference
- Language-specific implementations
- Copy-paste development

## Why Use These Tools?

### ⚡ **Faster Development**
Skip the setup phase and start building immediately with visual tools and live testing.

### 🎯 **Reduced Errors**
Visual builders prevent syntax errors and provide real-time validation.

### 🔄 **Immediate Feedback**
Test your configurations and API calls instantly without external tools.

### 📚 **Learning Accelerated**
Interactive examples help you understand concepts faster than static documentation.

## Getting Started

1. **New to Basefloor?** Start with the [Configuration Builder](/tools/config-builder) to create your first config file
2. **Ready to test?** Use the [API Explorer](/tools/api-explorer) to make live API calls
3. **Need code examples?** Check out the [Code Playground](/tools/code-playground) for multi-language snippets

## Environment Configuration

### Development
- **API Base URL**: `http://localhost:3000` (or your configured port)
- **Database**: Local MongoDB instance
- **CORS**: Allow localhost origins

### Production
- **API Base URL**: `https://api.yourdomain.com` (replace with your domain)
- **Database**: Cloud MongoDB (Atlas, etc.)
- **CORS**: Allow your production domains
- **SSL**: Required for production APIs

## Need Help?

- Check out the [Guide](/reference/guide/) for comprehensive documentation
- Browse [Examples](/examples/) for real-world use cases
- Explore the [API Reference](/api/routes/) for detailed endpoint documentation

---

*These tools work best with a running Basefloor server. Configure your environment variables and replace `yourdomain.com` with your actual domain.* 