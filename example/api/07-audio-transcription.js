/**
 * Feature 7: Audio Transcription
 * 
 * Speech-to-text capabilities with Google Cloud Speech integration.
 * This example demonstrates:
 * - Audio file upload and management
 * - Transcription with confidence scores and word-level timestamps
 * - Search functionality across transcriptions
 * - Mock implementation that works out-of-the-box
 * 
 * For production use:
 * - Replace mock upload with real file upload middleware
 * - Integrate with Google Cloud Speech API or other providers
 * - Add proper error handling and retry logic
 * - Implement webhook callbacks for long-running transcriptions
 * 
 * @example
 * // Start the server
 * node 07-audio-transcription.js
 * 
 * // Upload audio file
 * curl -X POST http://localhost:4000/transcription/upload \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -F "file=@audio.mp3"
 * 
 * // Start transcription
 * curl -X POST http://localhost:4000/transcription/:id/transcribe \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{"language":"en-US","enableAutomaticPunctuation":true}'
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
 * Upload audio file for transcription
 * 
 * @route POST /transcription/upload
 * @auth Required - User must be authenticated
 * @param {File} file - Audio file (supports common audio formats)
 * @returns {Object} 200 - Upload success response
 * @returns {Object} 401 - Authentication error
 * @returns {Object} 500 - Server error
 * 
 * @example
 * // Request (multipart/form-data)
 * // file: audio.mp3 (binary data)
 * 
 * // Response
 * {
 *   "success": true,
 *   "message": "Audio file uploaded successfully",
 *   "file": {
 *     "_id": "64a7b8c9d1e2f3g4h5i6j7k8",
 *     "filename": "audio_1634567890123.mp3",
 *     "originalName": "sample_audio.mp3",
 *     "size": 1048576,
 *     "mimetype": "audio/mpeg",
 *     "status": "uploaded"
 *   }
 * }
 */
API.post('/transcription/upload', [API.requireAuthentication], async (req, res) => {
  try {
    // Mock file upload for demo purposes (replace with real upload in production)
    const uploadResult = {
      filename: 'audio_' + Date.now() + '.mp3',
      originalName: 'sample_audio.mp3',
      size: 1024 * 1024, // 1MB
      mimetype: 'audio/mpeg',
      path: '/uploads/audio_' + Date.now() + '.mp3',
      url: '/files/audio_' + Date.now() + '.mp3'
    };
    
    // Store audio file metadata in database
    const audioRecord = await API.DB.AudioFiles.create({
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
      message: 'Audio file uploaded successfully',
      file: audioRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Start transcription of uploaded audio file
 * 
 * @route POST /transcription/:id/transcribe
 * @auth Required - User must be authenticated
 * @param {string} id - Audio file ID from upload response
 * @param {string} [language=en-US] - Language code for transcription
 * @param {boolean} [enableAutomaticPunctuation=true] - Enable automatic punctuation
 * @returns {Object} 200 - Transcription result
 * @returns {Object} 404 - Audio file not found
 * @returns {Object} 500 - Server error
 * 
 * @example
 * // Request
 * {
 *   "language": "en-US",
 *   "enableAutomaticPunctuation": true
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "transcription": {
 *     "id": "64a7b8c9d1e2f3g4h5i6j7k9",
 *     "text": "This is the transcribed text from the audio file.",
 *     "confidence": 0.95,
 *     "language": "en-US",
 *     "word_count": 10
 *   }
 * }
 */
API.post('/transcription/:id/transcribe', [API.requireAuthentication], async (req, res) => {
  try {
    const audioFile = await API.DB.AudioFiles.read({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    
    if (!audioFile) {
      return res.status(404).json({ error: 'Audio file not found' });
    }
    
    const { language = 'en-US', enableAutomaticPunctuation = true } = req.body;
    
    // Mock transcription for demo purposes (replace with real API in production)
    const transcriptionResult = {
      text: `This is a mock transcription of the audio file "${audioFile.originalName}". In a real implementation, this would be processed by Google Cloud Speech API or another transcription service.`,
      confidence: 0.95,
      words: [
        { word: 'This', startTime: 0.1, endTime: 0.3, confidence: 0.99 },
        { word: 'is', startTime: 0.4, endTime: 0.5, confidence: 0.98 },
        { word: 'a', startTime: 0.6, endTime: 0.7, confidence: 0.97 },
        { word: 'mock', startTime: 0.8, endTime: 1.0, confidence: 0.96 },
        { word: 'transcription', startTime: 1.1, endTime: 1.5, confidence: 0.95 }
      ]
    };
    
    // Create transcription record
    const transcription = await API.DB.Transcriptions.create({
      audio_file_id: audioFile._id,
      user_id: req.user._id,
      language,
      text: transcriptionResult.text,
      confidence: transcriptionResult.confidence,
      words: transcriptionResult.words || [],
      status: 'completed',
      provider: 'google'
    });
    
    // Update audio file status
    await API.DB.AudioFiles.update(
      { where: { _id: audioFile._id } },
      { status: 'transcribed', transcription_id: transcription._id }
    );
    
    res.json({
      success: true,
      transcription: {
        id: transcription._id,
        text: transcription.text,
        confidence: transcription.confidence,
        language: transcription.language,
        word_count: transcriptionResult.text.split(' ').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transcription result
API.get('/transcription/:id', [API.requireAuthentication], async (req, res) => {
  try {
    const transcription = await API.DB.Transcriptions.read({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    
    if (!transcription) {
      return res.status(404).json({ error: 'Transcription not found' });
    }
    
    res.json({ success: true, data: transcription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all user transcriptions
API.get('/transcriptions', [API.requireAuthentication], async (req, res) => {
  try {
    const transcriptions = await API.DB.Transcriptions.readAll({
      where: { user_id: req.user._id },
      sort: { created_at: -1 },
      limit: 50
    });
    
    res.json({ success: true, data: transcriptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search transcriptions by text content
API.post('/transcriptions/search', [API.requireAuthentication], async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Search for transcriptions containing the query text
    const transcriptions = await API.DB.Transcriptions.readAll({
      where: { 
        user_id: req.user._id,
        text: { $regex: query, $options: 'i' }
      },
      sort: { created_at: -1 }
    });
    
    res.json({ 
      success: true, 
      data: transcriptions,
      query,
      results: transcriptions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transcription with timestamps and word-level details
API.get('/transcription/:id/details', [API.requireAuthentication], async (req, res) => {
  try {
    const transcription = await API.DB.Transcriptions.read({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    
    if (!transcription) {
      return res.status(404).json({ error: 'Transcription not found' });
    }
    
    res.json({
      success: true,
      data: {
        id: transcription._id,
        text: transcription.text,
        confidence: transcription.confidence,
        language: transcription.language,
        words: transcription.words,
        stats: {
          word_count: transcription.text.split(' ').length,
          character_count: transcription.text.length,
          estimated_duration: transcription.words.length * 0.6 // rough estimate
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete transcription
API.delete('/transcription/:id', [API.requireAuthentication], async (req, res) => {
  try {
    const transcription = await API.DB.Transcriptions.read({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    
    if (!transcription) {
      return res.status(404).json({ error: 'Transcription not found' });
    }
    
    await API.DB.Transcriptions.delete({ where: { _id: req.params.id }});
    
    res.json({ success: true, message: 'Transcription deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.Start();

console.log('🎤 Audio Transcription Example API running!');
console.log('Try: POST /transcription/upload - Upload audio file');
console.log('Try: POST /transcription/:id/transcribe - Start transcription');
console.log('Try: GET /transcription/:id - Get transcription result');
console.log('Try: GET /transcriptions - Get all transcriptions');
console.log('Try: POST /transcriptions/search - Search transcriptions');
console.log('Try: GET /transcription/:id/details - Get detailed results');
console.log('Try: DELETE /transcription/:id - Delete transcription'); 