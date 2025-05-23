# AI Integration

Basefloor provides built-in support for AI services, making it easy to integrate AI capabilities into your applications.

## Configuration

Configure AI services in your `basefloor.config.js`:

```javascript
module.exports = (API) => ({
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4',
      maxTokens: 1000
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-sonnet-20240229',
      maxTokens: 1000
    },
    google: {
      apiKey: process.env.GOOGLE_AI_API_KEY,
      model: 'gemini-pro',
      maxTokens: 1000
    }
  }
})
```

## Usage

### Basic Text Generation

```javascript
// In your route handler
const response = await API.AI.openai.chat({
  messages: [
    { role: 'user', content: 'Hello, how are you?' }
  ]
})

console.log(response.content)
```

### Chat Conversations

```javascript
const conversation = await API.AI.anthropic.chat({
  messages: [
    { role: 'user', content: 'What is Basefloor?' },
    { role: 'assistant', content: 'Basefloor is a comprehensive API framework...' },
    { role: 'user', content: 'How do I get started?' }
  ]
})
```

### Streaming Responses

```javascript
const stream = await API.AI.openai.stream({
  messages: [
    { role: 'user', content: 'Write a long story...' }
  ]
})

for await (const chunk of stream) {
  process.stdout.write(chunk.content)
}
```

## Available Providers

### OpenAI
- Models: gpt-4, gpt-3.5-turbo, gpt-4-turbo
- Features: Chat, completions, streaming
- Configuration: API key required

### Anthropic
- Models: claude-3-opus, claude-3-sonnet, claude-3-haiku
- Features: Chat, streaming, long context
- Configuration: API key required

### Google AI
- Models: gemini-pro, gemini-pro-vision
- Features: Chat, multimodal capabilities
- Configuration: API key required

## Advanced Features

### Custom Prompts

```javascript
const customPrompt = await API.AI.openai.chat({
  messages: [
    { 
      role: 'system', 
      content: 'You are a helpful assistant that always responds in JSON format.' 
    },
    { role: 'user', content: 'Tell me about the weather' }
  ],
  response_format: { type: 'json_object' }
})
```

### Function Calling

```javascript
const functionCall = await API.AI.openai.chat({
  messages: [
    { role: 'user', content: 'What is the weather in New York?' }
  ],
  functions: [
    {
      name: 'get_weather',
      description: 'Get the current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' }
        }
      }
    }
  ]
})
```

### Image Analysis (Multimodal)

```javascript
const imageAnalysis = await API.AI.google.chat({
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'What do you see in this image?' },
        { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } }
      ]
    }
  ]
})
```

## Error Handling

AI services include built-in error handling and retry logic:

```javascript
try {
  const response = await API.AI.openai.chat({
    messages: [{ role: 'user', content: 'Hello' }]
  })
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    // Handle rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Retry logic
  } else if (error.code === 'insufficient_quota') {
    // Handle quota issues
  }
}
```

## Best Practices

1. **API Key Security**: Store API keys in environment variables
2. **Rate Limiting**: Implement proper rate limiting in your application
3. **Error Handling**: Always handle API errors gracefully
4. **Cost Management**: Monitor token usage and implement limits
5. **Content Filtering**: Implement content moderation for user inputs 