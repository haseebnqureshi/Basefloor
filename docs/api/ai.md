# AI Service

The AI service provides artificial intelligence capabilities to your Basefloor application through various provider integrations.

## Overview

The AI module enables you to integrate AI services like text generation, chat completion, and other AI-powered features into your application. It supports multiple providers and can be configured for single or multi-provider setups.

## Configuration

### Single Provider Setup

Configure a single AI provider in your `basefloor.config.js`:

```javascript
module.exports = (API) => {
  return {
    ai: {
      enabled: true,
      provider: '@anthropic/ai', // or '@ollama/ai', etc.
    },
    providers: {
      '@anthropic/ai': {
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
    },
  }
}
```

### Multiple Providers Setup

Configure multiple AI providers for different use cases:

```javascript
module.exports = (API) => {
  return {
    ai: {
      enabled: true,
      providers: {
        'Claude': '@anthropic/ai',
        'Local': '@ollama/ai',
      },
    },
    providers: {
      '@anthropic/ai': {
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
      '@ollama/ai': {
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      },
    },
  }
}
```

## Usage

### Single Provider

When using a single provider, access AI functionality directly:

```javascript
// In your route handlers
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    const response = await API.AI.chat({
      messages: [
        { role: 'user', content: message }
      ],
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
    });
    
    res.json({ response: response.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Multiple Providers

When using multiple providers, access each by its configured name:

```javascript
// Using Claude for complex reasoning
const claudeResponse = await API.AI.Claude.chat({
  messages: [{ role: 'user', content: 'Explain quantum computing' }],
  model: 'claude-3-sonnet-20240229',
});

// Using local Ollama for simple tasks
const localResponse = await API.AI.Local.chat({
  messages: [{ role: 'user', content: 'Summarize this text' }],
  model: 'llama2',
});
```

## Available Providers

### Anthropic (@anthropic/ai)

Provides access to Claude models for advanced reasoning and conversation.

**Configuration:**
```javascript
providers: {
  '@anthropic/ai': {
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: 'https://api.anthropic.com', // Optional, defaults to official API
  },
}
```

**Methods:**
- `chat(options)` - Generate chat completions
- `complete(options)` - Generate text completions

**Example:**
```javascript
const response = await API.AI.chat({
  messages: [
    { role: 'user', content: 'Write a haiku about programming' }
  ],
  model: 'claude-3-sonnet-20240229',
  max_tokens: 100,
});
```

### Ollama (@ollama/ai)

Provides access to local AI models through Ollama.

**Configuration:**
```javascript
providers: {
  '@ollama/ai': {
    baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  },
}
```

**Methods:**
- `chat(options)` - Generate chat completions
- `generate(options)` - Generate text completions

**Example:**
```javascript
const response = await API.AI.chat({
  messages: [
    { role: 'user', content: 'Hello, how are you?' }
  ],
  model: 'llama2',
});
```

## Error Handling

The AI service includes built-in error handling. If a provider fails to load due to missing dependencies, the service will log an error and continue without that provider:

```javascript
// The service will continue to work even if some providers fail
try {
  const response = await API.AI.chat(options);
} catch (error) {
  console.error('AI Service Error:', error.message);
  // Handle the error appropriately
}
```

## Environment Variables

Set up the following environment variables for your chosen providers:

```bash
# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# Ollama (if not running on default localhost:11434)
OLLAMA_BASE_URL=http://your-ollama-server:11434
```

## Dependencies

Each provider requires specific dependencies to be installed:

### Anthropic
```bash
npm install @anthropic-ai/sdk
```

### Ollama
```bash
npm install ollama
```

The system will automatically check for required dependencies and provide installation instructions if any are missing.

## Best Practices

1. **Environment Variables**: Always use environment variables for API keys and sensitive configuration
2. **Error Handling**: Implement proper error handling for AI service calls
3. **Rate Limiting**: Be aware of provider rate limits and implement appropriate throttling
4. **Model Selection**: Choose appropriate models for your use case (speed vs. capability)
5. **Token Management**: Monitor token usage to control costs

## Troubleshooting

### Provider Not Loading
If a provider fails to load, check:
1. Required dependencies are installed
2. Environment variables are set correctly
3. API keys are valid
4. Network connectivity to provider APIs

### Missing Dependencies
The system will provide specific installation commands if dependencies are missing:
```bash
# Example error message
Missing required dependencies for @anthropic/ai:
Please run 'npm install @anthropic-ai/sdk --save' in the Basefloor directory
``` 