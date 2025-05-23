module.exports = {
  // ... other configuration options
  
  // AI configuration
  ai: {
    // Option 1: Use a single provider
    provider: '@ollama',
    
    // Option 2: Configure multiple providers
    // providers: {
    //   default: '@ollama',
    //   chat: '@anthropic'
    // }
  },
  
  // Provider-specific configuration
  providers: {
    '@ollama': {
      // Base URL for Ollama API (defaults to localhost:11434 if not specified)
      baseUrl: 'http://localhost:11434',
      
      // Configure models
      models: {
        // Default model to use - this is what the user asked for
        default: 'gemma3:4b-it-qat',
        
        // You can add other model aliases if needed
        small: 'gemma3:4b-it-qat',
        large: 'gemma3:12b-it-qat'
      }
    },
    
    // Other provider configurations
    '@anthropic': {
      apiKey: 'your-anthropic-api-key',
      models: {
        default: 'claude-3-opus-20240229'
      }
    }
  }
}; 