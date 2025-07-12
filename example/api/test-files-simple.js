/**
 * Simple Files API Test
 * Demonstrates BasefloorAPI Files functionality with mock operations
 */
require('dotenv').config();
const api = require('../../packages/api');

const API = api({
  projectPath: __dirname,
  envPath: './.env'
});

API.Init();

// Health check
API.get('/', (req, res) => {
  res.json({ message: 'Files API Test - BasefloorAPI', services: ['auth', 'files'] });
});

// Test endpoint
API.get('/test', (req, res) => {
  res.json({ 
    message: 'Files API test endpoints',
    endpoints: [
      'POST /register - Register user',
      'POST /login - Login user', 
      'GET /user - Get current user',
      'POST /files/upload - Upload file (mock)',
      'GET /files - List files (mock)',
      'GET /files/:id - Get file info (mock)',
      'DELETE /files/:id - Delete file (mock)'
    ]
  });
});

// === Files API Mock Endpoints ===
// These demonstrate the Files API pattern without requiring actual file storage

API.post('/files/upload', [API.requireAuthentication], async (req, res) => {
  try {
    console.log('📁 Mock file upload request');
    
    // Mock file upload result
    const mockUploadResult = {
      filename: `file_${Date.now()}.txt`,
      originalName: 'test-document.txt',
      size: 1024,
      mimetype: 'text/plain',
      path: '/uploads/user-uploads/test-document.txt',
      url: `/files/download/file_${Date.now()}.txt`
    };
    
    // Store file metadata in Users collection (simulating Files table)
    const fileRecord = await API.DB.Users.create({
      filename: mockUploadResult.filename,
      originalName: mockUploadResult.originalName,
      size: mockUploadResult.size,
      mimetype: mockUploadResult.mimetype,
      path: mockUploadResult.path,
      url: mockUploadResult.url,
      user_id: req.user._id,
      file_type: 'file_record',
      created_at: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: 'Mock file uploaded successfully',
      file: fileRecord
    });
  } catch (error) {
    console.error('📁 Mock file upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

API.get('/files', [API.requireAuthentication], async (req, res) => {
  try {
    console.log('📁 Mock file list request');
    
    // Get user's files from Users collection (filtering by file_type)
    const files = await API.DB.Users.readAll({ 
      where: { 
        user_id: req.user._id,
        file_type: 'file_record'
      }
    });
    
    res.json({ 
      success: true, 
      data: files || [],
      message: 'Mock file listing - in real implementation, this would use API.DB.Files'
    });
  } catch (error) {
    console.error('📁 Mock file list error:', error);
    res.status(500).json({ error: error.message });
  }
});

API.get('/files/:id', [API.requireAuthentication], async (req, res) => {
  try {
    console.log('📁 Mock file info request:', req.params.id);
    
    const file = await API.DB.Users.read({ 
      where: { 
        _id: req.params.id, 
        user_id: req.user._id,
        file_type: 'file_record'
      }
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({ 
      success: true, 
      data: file,
      message: 'Mock file info - in real implementation, this would use API.DB.Files'
    });
  } catch (error) {
    console.error('📁 Mock file info error:', error);
    res.status(500).json({ error: error.message });
  }
});

API.delete('/files/:id', [API.requireAuthentication], async (req, res) => {
  try {
    console.log('📁 Mock file delete request:', req.params.id);
    
    const file = await API.DB.Users.read({ 
      where: { 
        _id: req.params.id, 
        user_id: req.user._id,
        file_type: 'file_record'
      }
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Delete the file record
    await API.DB.Users.delete({ 
      where: { _id: req.params.id }
    });
    
    res.json({ 
      success: true, 
      message: 'Mock file deleted successfully'
    });
  } catch (error) {
    console.error('📁 Mock file delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// === AI Service Mock ===
API.post('/ai/chat', [API.requireAuthentication], async (req, res) => {
  try {
    const { message } = req.body;
    console.log('🤖 Mock AI chat request:', message);
    
    res.json({
      success: true,
      response: `Mock AI Response: I received your message "${message}". This demonstrates BasefloorAPI's AI integration pattern.`,
      model: 'mock-gpt',
      usage: { tokens: 42 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === Email Service Mock ===
API.post('/email/send', [API.requireAuthentication], async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    console.log('📧 Mock email send:', { to, subject });
    
    res.json({
      success: true,
      message: `Mock email sent to ${to} with subject "${subject}"`,
      messageId: 'mock-' + Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === Transcription Service Mock ===
API.post('/transcription/audio', [API.requireAuthentication], async (req, res) => {
  try {
    console.log('🎤 Mock transcription request');
    
    res.json({
      success: true,
      text: 'This is a mock transcription result demonstrating BasefloorAPI transcription service integration.',
      duration: '3.2s',
      confidence: 0.95
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.Start();

console.log('🧪 Files API Test running on port 4000');
console.log('📍 Mock Endpoints:');
console.log('   POST /register - Register user');
console.log('   POST /login - Login user');
console.log('   GET /user - Get current user');
console.log('   GET /test - Show available endpoints');
console.log('');
console.log('📁 Files API (Mock):');
console.log('   POST /files/upload - Mock file upload');
console.log('   GET /files - List user files');
console.log('   GET /files/:id - Get file info');
console.log('   DELETE /files/:id - Delete file');
console.log('');
console.log('🤖 AI API (Mock):');
console.log('   POST /ai/chat - Mock AI chat');
console.log('');
console.log('📧 Email API (Mock):');
console.log('   POST /email/send - Mock email send');
console.log('');
console.log('🎤 Transcription API (Mock):');
console.log('   POST /transcription/audio - Mock audio transcription');