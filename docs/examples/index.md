# Examples

Welcome to the Basefloor examples section. Here you'll find practical examples of how to use Basefloor in real-world scenarios.

> **💡 Running Examples**
>
> All examples are located in the `example/api/` directory. Each example includes a complete working implementation with configuration files and detailed comments.

## Core Feature Examples

### [01 - Quick Setup](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/01-quick-setup.js)
Get started with the absolute minimum configuration. Perfect for understanding the basics.

### [02 - Authentication](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/02-authentication.js)
JWT-based authentication with user registration, login, and protected routes.

### [03 - MongoDB Integration](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/03-mongodb-integration.js)
Complete database integration with models, CRUD operations, and data relationships.

### [04 - File Management](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/04-file-management.js)
File upload, storage, processing, and serving with multiple provider support.

### [05 - AI Integration](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/05-ai-integration.js)
OpenAI, Anthropic, and Google AI integrations for chat and text generation.

### [06 - Email Services](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/06-email-services.js)
Email notifications with multiple providers (SendGrid, Postmark, Mailgun).

### [07 - Audio Transcription](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/07-audio-transcription.js)
Speech-to-text conversion with Google Cloud Speech API integration.

### [08 - Document Processing](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/08-document-processing.js)
Document conversion and processing with LibreOffice integration.

### [09 - Express-based Features](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/09-express-based.js)
Advanced Express.js features including middleware, streaming, and Server-Sent Events.

## Configuration Examples

### [Basic Config](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/basefloor.config.js)
Standard configuration for most applications.

### [Authentication Config](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/basefloor.auth.config.js)
Focused on authentication and user management features.

### [Documents Config](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/basefloor.documents.config.js)
Configuration for document processing and file conversion.

### [Transcription Config](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/basefloor.transcription.config.js)
Configuration for audio transcription services.

### [Comprehensive Config](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/basefloor-comprehensive.config.js)
Full-featured configuration with all services enabled.

## Documentation Examples

### [Basic Setup](./basic-setup)
Step-by-step guide to creating your first Basefloor project.

### [Complete Configuration](./complete-config)
Detailed walkthrough of all configuration options.

### [Blog API Example](./blog-api)
Complete blog API tutorial with users, posts, and comments.

## Getting Started

1. **Choose an example** that matches your use case
2. **Copy the configuration** and modify for your needs
3. **Run the example** to see it in action
4. **Explore the code** to understand the implementation

## Running an Example

```bash
# Navigate to the example directory
cd example/api

# Install dependencies
npm install

# Copy environment variables
cp .env-example .env

# Run a specific example
node 01-quick-setup.js
```

## Environment Setup

Most examples require environment variables. See the [environment setup guide](https://github.com/haseebnqureshi/basefloor/blob/main/example/api/.env-example) for required variables.

## Real-World Applications

These examples demonstrate patterns used in production applications:

- **Microservices Architecture** - Multiple focused APIs
- **Multi-tenant SaaS** - User isolation and data segregation  
- **E-commerce Platforms** - Product catalogs and order processing
- **Content Management** - File handling and user-generated content
- **AI-Powered Applications** - Intelligent features and automation 