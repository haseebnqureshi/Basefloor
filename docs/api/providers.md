# Provider System

The Provider system is the backbone of Basefloor's modular architecture, enabling seamless integration with third-party services through a unified interface.

## Overview

The Provider system allows you to integrate various external services (AI, email, transcription, storage, etc.) into your Basefloor application through a standardized interface. Each provider is a self-contained module that handles the specific implementation details of a service while exposing a consistent API.

## How Providers Work

### Provider Loader

The provider loader (`packages/api/providers/loader.js`) is responsible for:

1. **Dependency Checking**: Verifies required npm packages are installed
2. **Dynamic Loading**: Loads provider modules at runtime
3. **Error Handling**: Provides helpful error messages for missing dependencies
4. **Package Manager Detection**: Automatically detects whether you're using npm or yarn

### Provider Structure

Each provider follows a consistent structure:

```
packages/api/providers/
├── @anthropic/
│   └── ai.js
├── @google/
│   └── transcription.js
├── @postmark/
│   └── emails.js
├── @mailgun/
│   └── emails.js
├── loader.js
└── manifest.json
```

## Available Providers

### AI Providers

#### Anthropic (@anthropic/ai)
- **Service**: Claude AI models
- **Dependencies**: `@anthropic-ai/sdk`
- **Use Cases**: Text generation, chat completion, reasoning tasks

#### Ollama (@ollama/ai)
- **Service**: Local AI models
- **Dependencies**: `ollama`
- **Use Cases**: Local AI inference, privacy-focused applications

### Email Providers

#### Postmark (@postmark/emails)
- **Service**: Transactional email delivery
- **Dependencies**: `postmark`
- **Use Cases**: User notifications, password resets, verification emails

#### Mailgun (@mailgun/emails)
- **Service**: Email delivery and marketing
- **Dependencies**: `mailgun.js`
- **Use Cases**: Transactional and marketing emails, email validation

### Transcription Providers

#### Google Cloud Speech-to-Text (@google/transcription)
- **Service**: Speech-to-text transcription
- **Dependencies**: `@google-cloud/speech`
- **Use Cases**: Audio transcription, voice commands, accessibility features

### Storage Providers

#### MinIO (@minio/files)
- **Service**: S3-compatible object storage
- **Dependencies**: `minio`
- **Use Cases**: File storage, image hosting, backup solutions

#### DigitalOcean Spaces (@digitalocean/files)
- **Service**: Object storage
- **Dependencies**: `aws-sdk` (S3-compatible)
- **Use Cases**: CDN, file hosting, static assets

### Image Processing Providers

#### Sharp (@sharp/files)
- **Service**: High-performance image processing
- **Dependencies**: `sharp`
- **Use Cases**: Image resizing, format conversion, optimization

### Document Processing Providers

#### LibreOffice (@libreoffice/files)
- **Service**: Document conversion and processing
- **Dependencies**: System LibreOffice installation
- **Use Cases**: PDF generation, document conversion, office file processing

## Files Service Multi-Provider Architecture

The Files service uses a unique multi-provider architecture that combines multiple providers to handle different aspects of file management:

### Provider Roles

1. **Remote Provider**: Handles file storage and retrieval
   - Examples: `@minio/files`, `@digitalocean/files`, `@aws/files`
   - Responsibilities: Upload, download, delete files from remote storage

2. **Sharp Provider**: Handles image processing
   - Provider: `@sharp/files`
   - Responsibilities: Image resizing, format conversion, optimization
   - Automatically loaded when Files service is enabled

3. **LibreOffice Provider**: Handles document conversion
   - Provider: `@libreoffice/files`
   - Responsibilities: PDF generation, document format conversion
   - Automatically loaded when LibreOffice is installed

### How It Works

When the Files service is enabled, all three provider types are automatically loaded:

```javascript
// The Files service internally loads multiple providers
API.Files = {
  Remote: loadProvider('@minio/files'),      // Storage operations
  Sharp: loadProvider('@sharp/files'),       // Image processing
  LibreOffice: loadProvider('@libreoffice/files') // Document conversion
}
```

### Configuration Example

```javascript
// basefloor.config.js
files: {
  enabled: true,
  providers: {
    "Remote": "@minio/files",        // Required: Storage provider
    "Sharp": "@sharp/files"          // Optional: Image processing
    // LibreOffice provider auto-loaded if available
  }
},
providers: {
  "@minio/files": {
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    access: process.env.MINIO_ACCESS_KEY,
    secret: process.env.MINIO_SECRET_KEY,
    bucket: process.env.MINIO_BUCKET
  },
  "@sharp/files": {
    // Sharp configuration for image processing
  }
}
```

### File Processing Pipeline

Files flow through providers based on their type and requested operations:

1. **Upload**: Remote provider stores the file
2. **Image Processing**: Sharp provider handles resizing/conversion if needed
3. **Document Conversion**: LibreOffice provider converts office documents to PDF/images
4. **Download**: Remote provider retrieves the file

### Dependencies

The Files service requires specific dependencies to be installed in the BasefloorAPI packages directory:

```bash
cd packages/api
npm install minio sharp --save
```

Note: LibreOffice must be installed separately on the system for document conversion features.

### Database Providers

#### MongoDB (@mongodb/database)
- **Service**: NoSQL database
- **Dependencies**: `mongodb`
- **Use Cases**: Document storage, user data, application state

## Configuration

### Single Provider Configuration

```javascript
// basefloor.config.js
module.exports = (API) => {
  return {
    // Service configuration
    emails: {
      enabled: true,
      provider: '@postmark/emails',
    },
    
    // Provider-specific settings
    providers: {
      '@postmark/emails': {
        serverToken: process.env.POSTMARK_SERVER_TOKEN,
      },
    },
  }
}
```

### Multiple Provider Configuration

```javascript
// basefloor.config.js
module.exports = (API) => {
  return {
    // Service with multiple providers
    emails: {
      enabled: true,
      providers: {
        'Transactional': '@postmark/emails',
        'Marketing': '@mailgun/emails',
      },
    },
    
    // Provider configurations
    providers: {
      '@postmark/emails': {
        serverToken: process.env.POSTMARK_SERVER_TOKEN,
      },
      '@mailgun/emails': {
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
      },
    },
  }
}
```

## Dependency Management

### Automatic Dependency Checking

The provider system automatically checks for required dependencies and provides helpful installation instructions:

```bash
# Example error message
Missing required dependencies for @anthropic/ai:
Please run 'npm install @anthropic-ai/sdk --save' in the Basefloor directory to install the missing dependencies.
```

### Manifest System

The `manifest.json` file defines the required dependencies for each provider:

```json
{
  "@anthropic/ai": ["@anthropic-ai/sdk"],
  "@google/transcription": ["@google-cloud/speech"],
  "@postmark/emails": ["postmark"],
  "@mailgun/emails": ["mailgun.js"],
  "@minio/files": ["minio"],
  "@sharp/files": ["sharp"],
  "@libreoffice/files": ["libreoffice-convert"]
}
```

### Package Manager Detection

The system automatically detects your package manager and provides appropriate installation commands:

- **Yarn**: `yarn add --save package-name`
- **npm**: `npm install package-name --save`

## Creating Custom Providers

### Provider Template

```javascript
// packages/api/providers/@yourservice/yourprovider.js
module.exports = ({ providerVars, providerName }) => {
  // Initialize your service with configuration
  const client = new YourServiceClient({
    apiKey: providerVars.apiKey,
    baseURL: providerVars.baseURL,
  });

  return {
    // Expose your service methods
    async performAction(options) {
      try {
        const result = await client.action(options);
        return result;
      } catch (error) {
        throw new Error(`${providerName} error: ${error.message}`);
      }
    },

    // Add more methods as needed
    async anotherAction(options) {
      // Implementation
    },
  };
};
```

### Adding to Manifest

Update `manifest.json` to include your provider's dependencies:

```json
{
  "@yourservice/yourprovider": ["your-service-sdk", "other-dependency"]
}
```

### Configuration

Add your provider to the service configuration:

```javascript
// basefloor.config.js
module.exports = (API) => {
  return {
    yourservice: {
      enabled: true,
      provider: '@yourservice/yourprovider',
    },
    providers: {
      '@yourservice/yourprovider': {
        apiKey: process.env.YOUR_SERVICE_API_KEY,
        baseURL: process.env.YOUR_SERVICE_BASE_URL,
      },
    },
  }
}
```

## Error Handling

### Graceful Degradation

Providers are designed to fail gracefully. If a provider cannot be loaded due to missing dependencies or configuration issues, the service will:

1. Log a descriptive error message
2. Continue loading other providers
3. Allow the application to start without the failed provider

```javascript
// Example error handling in service modules
try {
  API.AI = { 
    ...API.AI,
    ...loadProvider(`${paths.basefloor}/providers/${ai.provider}`)({ 
      providerVars: providers[ai.provider],
      providerName: ai.provider,
    })
  }
} catch (err) {
  console.error(`AI Service Error: ${err.message}`);
  // Continue without AI service
  return API;
}
```

### Common Error Types

1. **Missing Dependencies**: Required npm packages not installed
2. **Invalid Configuration**: Missing or incorrect provider configuration
3. **Authentication Errors**: Invalid API keys or credentials
4. **Network Issues**: Unable to connect to provider services

## Best Practices

### Security

1. **Environment Variables**: Always use environment variables for sensitive configuration
2. **Credential Rotation**: Regularly rotate API keys and credentials
3. **Least Privilege**: Use service accounts with minimal required permissions
4. **Secure Storage**: Never commit credentials to version control

### Performance

1. **Connection Pooling**: Reuse connections where possible
2. **Caching**: Cache provider responses when appropriate
3. **Rate Limiting**: Respect provider rate limits
4. **Timeout Handling**: Implement appropriate timeouts

### Reliability

1. **Error Handling**: Implement comprehensive error handling
2. **Retry Logic**: Add retry mechanisms for transient failures
3. **Circuit Breakers**: Implement circuit breakers for external services
4. **Monitoring**: Monitor provider health and performance

### Development

1. **Testing**: Create tests for your custom providers
2. **Documentation**: Document provider configuration and usage
3. **Versioning**: Version your providers appropriately
4. **Backwards Compatibility**: Maintain backwards compatibility when possible

## Environment Variables

### Common Patterns

```bash
# AI Providers
ANTHROPIC_API_KEY=your_anthropic_key
OLLAMA_BASE_URL=http://localhost:11434

# Email Providers
POSTMARK_SERVER_TOKEN=your_postmark_token
MAILGUN_API_KEY=your_mailgun_key
MAILGUN_DOMAIN=your_domain.com

# Transcription Providers
GOOGLE_CREDENTIALS_BASE64=your_base64_credentials

# Storage Providers
MINIO_ENDPOINT=your_minio_endpoint
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key

# Database Providers
MONGODB_URI=mongodb://localhost:27017/yourdb
```

### Environment File Example

```bash
# .env.example
# Copy to .env and fill in your values

# AI Services
ANTHROPIC_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434

# Email Services
POSTMARK_SERVER_TOKEN=
MAILGUN_API_KEY=
MAILGUN_DOMAIN=

# Transcription Services
GOOGLE_CREDENTIALS_BASE64=

# Storage Services
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=

# Database Services
MONGODB_URI=mongodb://localhost:27017/basefloor
```

## Troubleshooting

### Provider Not Loading

1. **Check Dependencies**: Ensure required packages are installed
2. **Verify Configuration**: Check provider configuration in `basefloor.config.js`
3. **Environment Variables**: Verify environment variables are set correctly
4. **Network Connectivity**: Test connectivity to provider services

### Performance Issues

1. **Rate Limiting**: Check if you're hitting provider rate limits
2. **Network Latency**: Test network connectivity to provider services
3. **Resource Usage**: Monitor CPU and memory usage
4. **Caching**: Implement caching to reduce provider calls

### Authentication Errors

1. **API Keys**: Verify API keys are valid and not expired
2. **Permissions**: Check service account permissions
3. **Quotas**: Verify you haven't exceeded usage quotas
4. **IP Restrictions**: Check for IP-based access restrictions

## Provider Ecosystem

The Basefloor provider ecosystem is designed to be extensible. You can:

1. **Use Existing Providers**: Leverage pre-built integrations
2. **Create Custom Providers**: Build providers for your specific needs
3. **Contribute Providers**: Share providers with the community
4. **Mix and Match**: Use multiple providers for different use cases

This modular approach allows you to build applications that can easily adapt to changing requirements and integrate with new services as they become available. 