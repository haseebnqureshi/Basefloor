/**
 * Feature 5: AI Integration
 * Built-in support for AI services including OpenAI, Anthropic, and Google AI
 */
require('dotenv').config();
const api = require('../../packages/api');

const API = api({
  projectPath: __dirname,
  envPath: './.env'
});

// Initialize the API first to make middlewares available
API.Init();

// Chat completion with AI
API.post('/ai/chat', [API.requireAuthentication], async (req, res) => {
  try {
    const { message, provider = 'openai' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Use AI service
    const response = await API.AI.chat({
      provider,
      messages: [
        { role: 'user', content: message }
      ]
    });
    
    // Store conversation in database
    const conversation = await API.DB.Conversations.create({
      user_id: req.user._id,
      provider,
      user_message: message,
      ai_response: response.content,
      tokens_used: response.usage?.total_tokens || 0
    });
    
    res.json({
      success: true,
      response: response.content,
      provider,
      conversation_id: conversation._id,
      tokens_used: response.usage?.total_tokens || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate text with specific AI provider
API.post('/ai/generate', [API.requireAuthentication], async (req, res) => {
  try {
    const { prompt, provider = 'openai', max_tokens = 100 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const response = await API.AI.generate({
      provider,
      prompt,
      max_tokens: parseInt(max_tokens)
    });
    
    res.json({
      success: true,
      generated_text: response.text,
      provider,
      tokens_used: response.usage?.total_tokens || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze text sentiment
API.post('/ai/analyze', [API.requireAuthentication], async (req, res) => {
  try {
    const { text, analysis_type = 'sentiment' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    let prompt;
    switch (analysis_type) {
      case 'sentiment':
        prompt = `Analyze the sentiment of this text and respond with just: positive, negative, or neutral. Text: "${text}"`;
        break;
      case 'summary':
        prompt = `Summarize this text in one sentence: "${text}"`;
        break;
      case 'keywords':
        prompt = `Extract the top 5 keywords from this text, separated by commas: "${text}"`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid analysis type' });
    }
    
    const response = await API.AI.chat({
      provider: 'openai',
      messages: [{ role: 'user', content: prompt }]
    });
    
    res.json({
      success: true,
      analysis_type,
      result: response.content,
      original_text: text
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation history
API.get('/ai/conversations', [API.requireAuthentication], async (req, res) => {
  try {
    const conversations = await API.DB.Conversations.readAll({
      where: { user_id: req.user._id },
      sort: { created_at: -1 },
      limit: 50
    });
    
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI-powered content generation
API.post('/ai/content', [API.requireAuthentication], async (req, res) => {
  try {
    const { type, topic, tone = 'professional', length = 'medium' } = req.body;
    
    if (!type || !topic) {
      return res.status(400).json({ error: 'Type and topic are required' });
    }
    
    const lengthMap = {
      short: '1-2 paragraphs',
      medium: '3-4 paragraphs', 
      long: '5-6 paragraphs'
    };
    
    const prompt = `Write a ${type} about "${topic}" in a ${tone} tone. Length: ${lengthMap[length] || lengthMap.medium}`;
    
    const response = await API.AI.chat({
      provider: 'openai',
      messages: [{ role: 'user', content: prompt }]
    });
    
    // Save generated content
    const content = await API.DB.GeneratedContent.create({
      user_id: req.user._id,
      type,
      topic,
      tone,
      length,
      content: response.content,
      tokens_used: response.usage?.total_tokens || 0
    });
    
    res.json({
      success: true,
      content: response.content,
      content_id: content._id,
      metadata: { type, topic, tone, length }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available AI providers
API.get('/ai/providers', [API.requireAuthentication], (req, res) => {
  res.json({
    success: true,
    providers: [
      { name: 'openai', description: 'OpenAI GPT models', available: !!process.env.OPENAI_API_KEY },
      { name: 'anthropic', description: 'Anthropic Claude models', available: !!process.env.ANTHROPIC_API_KEY },
      { name: 'google', description: 'Google AI models', available: !!process.env.GOOGLE_AI_API_KEY }
    ]
  });
});

API.Start();

console.log('🤖 AI Integration Example API running!');
console.log('Try: POST /ai/chat - Chat with AI');
console.log('Try: POST /ai/generate - Generate text');
console.log('Try: POST /ai/analyze - Analyze text sentiment/summary');
console.log('Try: POST /ai/content - Generate content');
console.log('Try: GET /ai/conversations - Get chat history');
console.log('Try: GET /ai/providers - Get available AI providers'); 