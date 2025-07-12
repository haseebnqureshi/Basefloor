/**
 * Comprehensive BasefloorAPI Test
 * Tests Files, AI, Email, Transcription, and core CRUD functionality
 */
require('dotenv').config();
const api = require('../../packages/api');

const API = api({
  projectPath: __dirname,
  envPath: './.env',
  configPath: './basefloor.comprehensive-test.config.js'
});

// Initialize API
API.Init();

// Health check
API.get('/', (req, res) => {
  res.json({ 
    message: 'BasefloorAPI Comprehensive Test', 
    timestamp: new Date().toISOString(),
    services: ['auth', 'users', 'files', 'ai', 'email', 'transcription']
  });
});

// === Files API Endpoints ===

// Upload file
API.post('/files/upload', [API.requireAuthentication], async (req, res) => {
  try {
    console.log('📁 File upload request received');
    
    // Use Files service for upload
    const uploadResult = await API.Files.upload(req, {
      folder: 'user-uploads',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/*', 'text/*', 'application/pdf', 'audio/*']
    });
    
    console.log('📁 File uploaded:', uploadResult);
    
    // Store file metadata
    const fileRecord = await API.DB.Files.create({
      filename: uploadResult.filename,
      originalName: uploadResult.originalName,
      size: uploadResult.size,
      mimetype: uploadResult.mimetype,
      path: uploadResult.path,
      url: uploadResult.url,
      user_id: req.user._id,
      created_at: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      file: fileRecord
    });
  } catch (error) {
    console.error('📁 File upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download file
API.get('/files/:id/download', [API.requireAuthentication], async (req, res) => {
  try {
    const file = await API.DB.Files.read({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileStream = await API.Files.download(file.path);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === AI Service Endpoints ===

API.post('/ai/chat', [API.requireAuthentication], async (req, res) => {
  try {
    const { message, model = 'gpt-3.5-turbo' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('🤖 AI chat request:', { message, model });
    
    // Mock response for testing without API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'test-key-disabled') {
      const mockResponse = {
        success: true,
        message: 'This is a mock AI response for testing. To use real AI, set OPENAI_API_KEY in your .env file.',
        model: model,
        usage: { tokens: 50 },
        timestamp: new Date().toISOString()
      };
      return res.json(mockResponse);
    }
    
    const response = await API.AI.chat({
      model: model,
      messages: [
        { role: 'user', content: message }
      ]
    });
    
    res.json({ 
      success: true, 
      response: response.choices[0].message.content,
      model: model,
      usage: response.usage
    });
  } catch (error) {
    console.error('🤖 AI error:', error);
    res.status(500).json({ error: error.message });
  }
});

// === Email Service Endpoints ===

API.post('/email/send', [API.requireAuthentication], async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ error: 'to, subject, and text/html are required' });
    }
    
    console.log('📧 Email send request:', { to, subject });
    
    // Mock response for testing without email credentials
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'test@example.com') {
      const mockResponse = {
        success: true,
        message: 'Mock email sent successfully. To send real emails, configure EMAIL_USER and EMAIL_PASS in your .env file.',
        messageId: 'mock-' + Date.now(),
        timestamp: new Date().toISOString()
      };
      return res.json(mockResponse);
    }
    
    const result = await API.Email.send({
      to: to,
      subject: subject,
      text: text,
      html: html
    });
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('📧 Email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// === Transcription Service Endpoints ===

API.post('/transcription/audio', [API.requireAuthentication], async (req, res) => {
  try {
    console.log('🎤 Transcription request received');
    
    // Mock response for testing without API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'test-key-disabled') {
      const mockResponse = {
        success: true,
        text: 'This is a mock transcription result for testing. To use real transcription, set OPENAI_API_KEY in your .env file.',
        duration: '5.2s',
        timestamp: new Date().toISOString()
      };
      return res.json(mockResponse);
    }
    
    const transcription = await API.Transcription.transcribe(req);
    
    res.json({ 
      success: true, 
      text: transcription.text,
      duration: transcription.duration
    });
  } catch (error) {
    console.error('🎤 Transcription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint
API.get('/test', (req, res) => {
  res.json({ 
    message: 'Comprehensive test API is working!',
    endpoints: {
      files: 'POST /files/upload, GET /files, GET /files/:id, DELETE /files/:id',
      ai: 'POST /ai/chat',
      email: 'POST /email/send',
      transcription: 'POST /transcription/audio',
      auth: 'POST /register, POST /login, GET /user'
    }
  });
});

API.Start();

console.log('🧪 Comprehensive Test API running on port 4000 with in-memory database');
console.log('📍 Endpoints:');
console.log('   POST /register - Register new user');
console.log('   POST /login - Login user');
console.log('   GET /user - Get current user (requires auth)');
console.log('   GET /test - Test endpoint');
console.log('   GET / - Health check');
console.log('');
console.log('📁 Files API:');
console.log('   POST /files/upload - Upload file (requires auth)');
console.log('   GET /files - List user files (requires auth)');
console.log('   GET /files/:id - Get file info (requires auth)');
console.log('   GET /files/:id/download - Download file (requires auth)');
console.log('   DELETE /files/:id - Delete file (requires auth)');
console.log('');
console.log('🤖 AI API:');
console.log('   POST /ai/chat - Chat with AI (requires auth)');
console.log('');
console.log('📧 Email API:');
console.log('   POST /email/send - Send email (requires auth)');
console.log('');
console.log('🎤 Transcription API:');
console.log('   POST /transcription/audio - Transcribe audio (requires auth)');