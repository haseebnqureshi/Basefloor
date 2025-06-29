/**
 * Feature 4: File Management
 * Upload, process, and serve files with support for multiple storage providers
 */
require('dotenv').config();
const api = require('../../packages/api');

const API = api({
  projectPath: __dirname,
  envPath: './.env'
});

// Initialize the API first to make middlewares available
API.Init();

// Upload a file
API.post('/files/upload', [API.requireAuthentication], async (req, res) => {
  try {
    // File upload handled by basefloor files middleware
    const uploadResult = await API.Files.upload(req, {
      folder: 'user-uploads',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/*', 'text/*', 'application/pdf']
    });
    
    // Store file metadata in database
    const fileRecord = await API.DB.Files.create({
      filename: uploadResult.filename,
      originalName: uploadResult.originalName,
      size: uploadResult.size,
      mimetype: uploadResult.mimetype,
      path: uploadResult.path,
      url: uploadResult.url,
      user_id: req.user._id
    });
    
    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      file: fileRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's files
API.get('/files', [API.requireAuthentication], async (req, res) => {
  try {
    const files = await API.DB.Files.readAll({ 
      where: { user_id: req.user._id },
      sort: { created_at: -1 }
    });
    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download a file
API.get('/files/:id/download', [API.requireAuthentication], async (req, res) => {
  try {
    const file = await API.DB.Files.read({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Stream file from storage
    const fileStream = await API.Files.download(file.path);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get file info
API.get('/files/:id', [API.requireAuthentication], async (req, res) => {
  try {
    const file = await API.DB.Files.read({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a file
API.delete('/files/:id', [API.requireAuthentication], async (req, res) => {
  try {
    const file = await API.DB.Files.read({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Delete from storage
    await API.Files.delete(file.path);
    
    // Delete from database
    await API.DB.Files.delete({ where: { _id: req.params.id }});
    
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process image (resize, convert, etc.)
API.post('/files/:id/process', [API.requireAuthentication], async (req, res) => {
  try {
    const file = await API.DB.Files.read({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'File is not an image' });
    }
    
    // Process image with specified dimensions
    const { width = 300, height = 300, format = 'jpeg' } = req.body;
    
    const processedFile = await API.Files.processImage(file.path, {
      width: parseInt(width),
      height: parseInt(height),
      format,
      folder: 'processed'
    });
    
    // Save processed file record
    const processedRecord = await API.DB.Files.create({
      filename: processedFile.filename,
      originalName: `processed_${file.originalName}`,
      size: processedFile.size,
      mimetype: `image/${format}`,
      path: processedFile.path,
      url: processedFile.url,
      user_id: req.user._id,
      parent_id: file._id
    });
    
    res.json({ 
      success: true, 
      message: 'Image processed successfully',
      file: processedRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.Start();

console.log('📁 File Management Example API running!');
console.log('Try: POST /files/upload - Upload a file');
console.log('Try: GET /files - Get user files');
console.log('Try: GET /files/:id - Get file info');
console.log('Try: GET /files/:id/download - Download file');
console.log('Try: POST /files/:id/process - Process image');
console.log('Try: DELETE /files/:id - Delete file'); 