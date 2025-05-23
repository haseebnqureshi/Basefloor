# AI Integration

MinAPI provides built-in support for AI services, making it easy to integrate AI capabilities into your applications.

## Configuration

Configure AI services in your `minapi.config.js`:

### Anthropic Claude

```javascript
{
  ai: {
    provider: '@anthropic/claude',
    defaultModel: 'claude-3-sonnet'
  },
  providers: {
    '@anthropic/claude': {
      apiKey: process.env.ANTHROPIC_API_KEY
    }
  }
}
```

### OpenAI

```javascript
{
  ai: {
    provider: '@openai/gpt',
    defaultModel: 'gpt-4'
  },
  providers: {
    '@openai/gpt': {
      apiKey: process.env.OPENAI_API_KEY
    }
  }
}
```

## Usage

### Text Generation

```javascript
// Generate text using the configured AI provider
const response = await API.AI.generate({
  prompt: 'Write a summary of this document',
  context: documentText,
  maxTokens: 500
});

console.log(response.text);
```

### Chat Completion

```javascript
// Have a conversation with the AI
const chatResponse = await API.AI.chat({
  messages: [
    { role: 'user', content: 'What is MinAPI?' },
    { role: 'assistant', content: 'MinAPI is a comprehensive API framework...' },
    { role: 'user', content: 'How do I install it?' }
  ]
});
```

### Document Analysis

```javascript
// Analyze uploaded documents
app.post('/analyze-document', async (req, res) => {
  const file = req.file;
  const documentText = await API.Files.extractText(file.path);
  
  const analysis = await API.AI.generate({
    prompt: 'Analyze this document and provide key insights:',
    context: documentText
  });
  
  res.json({ analysis: analysis.text });
});
```

## Environment Variables

Set up your AI provider credentials:

```env
# Anthropic
ANTHROPIC_API_KEY=your-anthropic-key

# OpenAI
OPENAI_API_KEY=your-openai-key
```

## Examples

### Content Moderation

```javascript
const moderationResult = await API.AI.moderate({
  text: userGeneratedContent,
  categories: ['hate', 'violence', 'spam']
});

if (moderationResult.flagged) {
  // Handle flagged content
}
```

### Smart Search

```javascript
// Semantic search using AI embeddings
const searchResults = await API.AI.search({
  query: userQuery,
  documents: documentCollection,
  limit: 10
});
``` 