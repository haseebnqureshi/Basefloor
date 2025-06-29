/**
 * Feature 8: Document Processing
 * 
 * Convert and process documents between different formats.
 * This example demonstrates:
 * - Document upload with format validation
 * - Format conversion (PDF, Word, Excel, PowerPoint)
 * - Text extraction from documents
 * - Document merging capabilities
 * - Mock implementation that works out-of-the-box
 * 
 * For production use:
 * - Replace mock functions with LibreOffice, pandoc, or cloud APIs
 * - Add support for more file formats
 * - Implement asynchronous processing for large files
 * - Add progress tracking and status updates
 * - Integrate OCR for scanned documents
 * 
 * @example
 * // Start the server
 * node 08-document-processing.js
 * 
 * // Upload document
 * curl -X POST http://localhost:4000/documents/upload \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -F "file=@document.pdf"
 * 
 * // Convert document
 * curl -X POST http://localhost:4000/documents/:id/convert \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{"format":"docx"}'
 */
require('dotenv').config();
const api = require('../../packages/api');

const API = api({
  projectPath: __dirname,
  envPath: './.env'
});

// Initialize the API first to make middlewares available
API.Init();

/**
 * Upload document for processing
 * 
 * @route POST /documents/upload
 * @auth Required - User must be authenticated
 * @param {File} file - Document file (PDF, Word, Excel, PowerPoint, text)
 * @returns {Object} 200 - Upload success response
 * @returns {Object} 401 - Authentication error
 * @returns {Object} 500 - Server error
 * 
 * @example
 * // Request (multipart/form-data)
 * // file: document.pdf (binary data)
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Document uploaded successfully",
 *   "document": {
 *     "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
 *     "filename": "doc_1634567890123.pdf",
 *     "originalName": "sample_document.pdf",
 *     "size": 2097152,
 *     "mimetype": "application/pdf",
 *     "status": "uploaded"
 *   }
 * }
 */
API.post('/documents/upload', [API.requireAuthentication], async (req, res) => {
  try {
    // Mock file upload for demo purposes (replace with real upload in production)
    const uploadResult = {
      filename: 'doc_' + Date.now() + '.pdf',
      originalName: 'sample_document.pdf',
      size: 2 * 1024 * 1024, // 2MB
      mimetype: 'application/pdf',
      path: '/uploads/doc_' + Date.now() + '.pdf',
      url: '/files/doc_' + Date.now() + '.pdf'
    };
    
    // Store document metadata in database
    const documentRecord = await API.DB.Documents.create({
      filename: uploadResult.filename,
      originalName: uploadResult.originalName,
      size: uploadResult.size,
      mimetype: uploadResult.mimetype,
      path: uploadResult.path,
      url: uploadResult.url,
      user_id: req.user._id,
      status: 'uploaded'
    });
    
    res.json({ 
      success: true, 
      message: 'Document uploaded successfully',
      document: documentRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Convert document to different format
 * 
 * @route POST /documents/:id/convert
 * @auth Required - User must be authenticated
 * @param {string} id - Document ID from upload response
 * @param {string} format - Target format (pdf, docx, doc, xlsx, txt, etc.)
 * @returns {Object} 200 - Conversion success response
 * @returns {Object} 400 - Invalid format or missing parameters
 * @returns {Object} 404 - Document not found
 * @returns {Object} 500 - Server error
 * 
 * @example
 * // Request
 * {
 *   "format": "docx"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Document converted successfully",
 *   "converted_document": {
 *     "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
 *     "filename": "converted_1634567890124.docx",
 *     "originalName": "converted_sample_document.pdf",
 *     "mimetype": "application/docx",
 *     "status": "converted"
 *   },
 *   "original_format": "application/pdf",
 *   "target_format": "docx"
 * }
 */
API.post('/documents/:id/convert', [API.requireAuthentication], async (req, res) => {
  try {
    const document = await API.DB.Documents.read({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const { format } = req.body;
    
    if (!format) {
      return res.status(400).json({ error: 'Target format is required' });
    }
    
    // Mock document conversion for demo purposes (replace with real conversion in production)
    const convertedResult = {
      filename: `converted_${Date.now()}.${format}`,
      size: document.size * 0.8, // Assume conversion reduces size
      mimetype: `application/${format}`,
      path: `/uploads/converted_${Date.now()}.${format}`,
      url: `/files/converted_${Date.now()}.${format}`
    };
    
    // Create converted document record
    const convertedDocument = await API.DB.Documents.create({
      filename: convertedResult.filename,
      originalName: `converted_${document.originalName}`,
      size: convertedResult.size,
      mimetype: convertedResult.mimetype,
      path: convertedResult.path,
      url: convertedResult.url,
      user_id: req.user._id,
      parent_id: document._id,
      status: 'converted',
      conversion_format: format
    });
    
    res.json({
      success: true,
      message: 'Document converted successfully',
      converted_document: convertedDocument,
      original_format: document.mimetype,
      target_format: format
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extract text content from document
API.post('/documents/:id/extract-text', [API.requireAuthentication], async (req, res) => {
  try {
    const document = await API.DB.Documents.read({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Mock text extraction for demo purposes (replace with real extraction in production)
    const textContent = `This is mock extracted text from the document "${document.originalName}". In a real implementation, this would be extracted using PDF parsers, OCR, or other text extraction tools. The document contains important information and would typically have much more content than this sample text.`;
    
    // Store extracted text
    const extraction = await API.DB.DocumentExtractions.create({
      document_id: document._id,
      user_id: req.user._id,
      text_content: textContent,
      word_count: textContent.split(' ').length,
      character_count: textContent.length
    });
    
    res.json({
      success: true,
      extraction: {
        id: extraction._id,
        text: textContent,
        stats: {
          word_count: extraction.word_count,
          character_count: extraction.character_count,
          estimated_reading_time: Math.ceil(extraction.word_count / 200) // minutes
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's documents
API.get('/documents', [API.requireAuthentication], async (req, res) => {
  try {
    const documents = await API.DB.Documents.readAll({
      where: { user_id: req.user._id },
      sort: { created_at: -1 }
    });
    
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get document details with conversion history
API.get('/documents/:id', [API.requireAuthentication], async (req, res) => {
  try {
    const document = await API.DB.Documents.read({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Get conversion history (documents converted from this one)
    const conversions = await API.DB.Documents.readAll({
      where: { parent_id: document._id },
      sort: { created_at: -1 }
    });
    
    // Get text extractions
    const extractions = await API.DB.DocumentExtractions.readAll({
      where: { document_id: document._id },
      sort: { created_at: -1 }
    });
    
    res.json({
      success: true,
      data: {
        ...document,
        conversions,
        extractions,
        stats: {
          conversion_count: conversions.length,
          extraction_count: extractions.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Merge multiple documents
API.post('/documents/merge', [API.requireAuthentication], async (req, res) => {
  try {
    const { document_ids, output_format = 'pdf' } = req.body;
    
    if (!document_ids || !Array.isArray(document_ids) || document_ids.length < 2) {
      return res.status(400).json({ error: 'At least 2 document IDs are required for merging' });
    }
    
    // Get all documents
    const documents = await API.DB.Documents.readAll({
      where: { 
        _id: { $in: document_ids },
        user_id: req.user._id
      }
    });
    
    if (documents.length !== document_ids.length) {
      return res.status(400).json({ error: 'Some documents not found or not accessible' });
    }
    
    // Mock document merging for demo purposes (replace with real merging in production)
    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
    const mergedResult = {
      filename: `merged_${Date.now()}.${output_format}`,
      size: totalSize * 1.1, // Merged file slightly larger
      mimetype: `application/${output_format}`,
      path: `/uploads/merged_${Date.now()}.${output_format}`,
      url: `/files/merged_${Date.now()}.${output_format}`
    };
    
    // Create merged document record
    const mergedDocument = await API.DB.Documents.create({
      filename: mergedResult.filename,
      originalName: `merged_documents.${output_format}`,
      size: mergedResult.size,
      mimetype: mergedResult.mimetype,
      path: mergedResult.path,
      url: mergedResult.url,
      user_id: req.user._id,
      status: 'merged',
      source_documents: document_ids
    });
    
    res.json({
      success: true,
      message: 'Documents merged successfully',
      merged_document: mergedDocument,
      source_count: documents.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supported conversion formats
API.get('/documents/formats', [API.requireAuthentication], (req, res) => {
  res.json({
    success: true,
    supported_formats: {
      input: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/html'
      ],
      output: [
        'pdf',
        'docx',
        'doc',
        'xlsx',
        'xls',
        'pptx',
        'ppt',
        'txt',
        'html',
        'odt',
        'ods',
        'odp'
      ]
    }
  });
});

API.Start();

console.log('📄 Document Processing Example API running!');
console.log('Try: POST /documents/upload - Upload document');
console.log('Try: POST /documents/:id/convert - Convert document format');
console.log('Try: POST /documents/:id/extract-text - Extract text content');
console.log('Try: GET /documents - Get all documents');
console.log('Try: GET /documents/:id - Get document details');
console.log('Try: POST /documents/merge - Merge multiple documents');
console.log('Try: GET /documents/formats - Get supported formats'); 