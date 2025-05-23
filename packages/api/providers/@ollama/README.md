# Ollama Provider for MinAPI

This provider enables integration with [Ollama](https://ollama.ai/), allowing your MinAPI application to use locally running LLMs without requiring API keys or internet connectivity.

## Overview

Ollama is an open-source tool that lets you run large language models locally on your computer. This provider connects your MinAPI application to a locally running Ollama instance, making it possible to use various models like Gemma, Llama, Mistral, and others directly from your application.

## Requirements

1. **Ollama Installation**: 
   - Download and install Ollama from [ollama.ai](https://ollama.ai/)
   - Make sure Ollama is running (default: http://localhost:11434)

2. **Model Installation**:
   - Install the models you want to use with: `ollama pull <model-name>`
   - For text-only models: `ollama pull gemma3:4b-it-qat` or `ollama pull gemma3:12b-it-qat`
   - For image support, install a multimodal model: `ollama pull llava:13b`

3. **Dependencies**:
   - The provider requires `node-fetch` package
   - It will be automatically installed if you include this provider in your MinAPI configuration

## Configuration

Add the Ollama provider to your `minapi.config.js`:

```javascript
module.exports = {
  ai: {
    provider: '@ollama'
  },
  providers: {
    '@ollama': {
      // Optional: change base URL if Ollama is running on a different host/port
      baseUrl: 'http://localhost:11434',
      
      models: {
        // Recommended: specify the default model to use (Gemma 3 models are great for text tasks)
        default: 'gemma3:4b-it-qat',
        
        // Optional: configure model aliases for convenience
        small: 'gemma3:4b-it-qat',
        large: 'gemma3:12b-it-qat',
        
        // For image support, configure a multimodal model
        multimodal: 'llava:13b'
      }
    }
  }
};
```

## Usage

### Basic Usage

```javascript
const response = await API.AI.message({
  textPrompt: "What is the capital of France?"
});
console.log(response.content[0].text);
```

### Advanced Options

```javascript
const response = await API.AI.message({
  // Use a specific model (overrides the default)
  model: "gemma3:12b-it-qat",
  
  // Control generation parameters
  temperature: 0.7,  // 0.0 to 1.0, higher = more creative
  max_tokens: 2048,  // Maximum response length
  
  // Your prompt
  textPrompt: "Write a short poem about coding."
});
```

### Using with Message Arrays

```javascript
const response = await API.AI.message({
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Hello, how are you today?'
        }
      ]
    }
  ]
});
```

### Using with Images (Multimodal Models)

To use images with the Ollama provider, you need to:

1. Install a multimodal model in Ollama (like `llava:13b`)
2. Create a message that includes both text and image content
3. Make sure to specify the multimodal model

```javascript
const response = await API.AI.message({
  // Specify a multimodal model
  model: "llava:13b",
  
  // Create a message with text and image
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'What can you tell me about this image?'
        },
        {
          type: 'image',
          image_url: {
            url: 'https://example.com/image.jpg'
            // Or local file path: '/path/to/image.jpg'
          }
        }
      ]
    }
  ]
});

console.log(response.content[0].text);
```

You can include:
- Remote images via URLs (`https://example.com/image.jpg`)
- Local images via file paths (`/path/to/image.jpg`)

## Supported Models

### Text Models (Recommended)

These models are recommended for text-only tasks:

- `gemma3:4b-it-qat` - Efficient, smaller Gemma 3 model (recommended default)
- `gemma3:12b-it-qat` - Larger Gemma 3 model with enhanced capabilities
- `llama3:8b` - Good general-purpose model
- `mistral:7b` - Efficient model with good performance
- `falcon:7b` - Fast inference with good results

### Multimodal Models (For Image Support)

These models support image inputs:

- `llava:13b` - Good general-purpose multimodal model
- `llava:7b` - Lighter multimodal model
- `bakllava:15b` - Extended version of LLaVA
- `moondream:v2` - Lightweight model optimized for vision tasks

Always ensure you've pulled the model before using it: `ollama pull gemma3:4b-it-qat`

## Limitations

1. **No Streaming**: Response streaming is not currently implemented.

2. **Simple Message Conversion**: Complex message formats may be simplified.

## Troubleshooting

1. **Connection Errors**:
   - Make sure Ollama is running (`ps aux | grep ollama`)
   - Verify the base URL in your configuration

2. **Model Not Found Errors**:
   - Ensure you've pulled the model with `ollama pull <model-name>`
   - Check that the model name matches exactly what's in Ollama

3. **Image Processing Errors**:
   - Make sure the image exists at the specified path
   - Verify that your model supports multimodal inputs (text + images)
   - Some models have specific size requirements for images

## Performance Considerations

- Local LLM performance depends heavily on your hardware
- Gemma3:4b-it-qat provides a good balance of quality and performance
- Larger models like Gemma3:12b-it-qat require more RAM but offer better results
- First generation after starting Ollama may be slower due to model loading
- Multimodal models require more resources than text-only models 