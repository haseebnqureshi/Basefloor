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

// Test routes without authentication for transcription testing
API.post('/test/transcription/upload', async (req, res) => {
  try {
    const uploadResult = {
      filename: 'test_audio_' + Date.now() + '.mp3',
      originalName: 'test_sample_audio.mp3',
      size: 1024 * 1024,
      mimetype: 'audio/mpeg',
      path: '/uploads/test_audio_' + Date.now() + '.mp3',
      url: '/files/test_audio_' + Date.now() + '.mp3'
    };
    
    const audioRecord = await API.DB.AudioFiles.create({
      filename: uploadResult.filename,
      originalName: uploadResult.originalName,
      size: uploadResult.size,
      mimetype: uploadResult.mimetype,
      path: uploadResult.path,
      url: uploadResult.url,
      user_id: 'test-user-id',
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

API.post('/test/transcription/:id/transcribe', async (req, res) => {
  try {
    const audioFile = await API.DB.AudioFiles.read({ 
      where: { _id: req.params.id }
    });
    
    if (!audioFile) {
      return res.status(404).json({ error: 'Audio file not found' });
    }
    
    const { language = 'en-US', enableAutomaticPunctuation = true } = req.body;
    
    const transcriptionResult = {
      text: `This is a test transcription of the audio file "${audioFile.originalName}". The transcription service successfully processed the audio and extracted this text content with high confidence.`,
      confidence: 0.95,
      words: [
        { word: 'This', startTime: 0.1, endTime: 0.3, confidence: 0.99 },
        { word: 'is', startTime: 0.4, endTime: 0.5, confidence: 0.98 },
        { word: 'a', startTime: 0.6, endTime: 0.7, confidence: 0.97 },
        { word: 'test', startTime: 0.8, endTime: 1.0, confidence: 0.96 },
        { word: 'transcription', startTime: 1.1, endTime: 1.5, confidence: 0.95 }
      ]
    };
    
    const transcription = await API.DB.Transcriptions.create({
      audio_file_id: audioFile._id,
      user_id: 'test-user-id',
      language,
      text: transcriptionResult.text,
      confidence: transcriptionResult.confidence,
      words: transcriptionResult.words || [],
      status: 'completed',
      provider: 'google'
    });
    
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

API.get('/test/transcription/:id', async (req, res) => {
  try {
    const transcription = await API.DB.Transcriptions.read({ 
      where: { _id: req.params.id }
    });
    
    if (!transcription) {
      return res.status(404).json({ error: 'Transcription not found' });
    }
    
    res.json({ success: true, data: transcription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.get('/test/transcriptions', async (req, res) => {
  try {
    const transcriptions = await API.DB.Transcriptions.readAll({
      where: { user_id: 'test-user-id' },
      sort: { created_at: -1 },
      limit: 50
    });
    
    res.json({ success: true, data: transcriptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.post('/test/transcriptions/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const transcriptions = await API.DB.Transcriptions.readAll({
      where: { 
        user_id: 'test-user-id',
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

API.get('/test/transcription/:id/details', async (req, res) => {
  try {
    const transcription = await API.DB.Transcriptions.read({ 
      where: { _id: req.params.id }
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
          estimated_duration: transcription.words.length * 0.6
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.delete('/test/transcription/:id', async (req, res) => {
  try {
    const transcription = await API.DB.Transcriptions.read({ 
      where: { _id: req.params.id }
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
console.log('🧪 Testing audio transcription capabilities...\n');

// Wait for server to start, then test transcription operations
setTimeout(async () => {
  const baseUrl = `http://localhost:${API.port || 4000}`;
  const axios = require('axios');
  let uploadedFileId = null;
  let transcriptionId = null;
  
  try {
    console.log('1. Testing audio file upload...');
    const uploadResponse = await axios.post(`${baseUrl}/test/transcription/upload`);
    uploadedFileId = uploadResponse.data.file._id;
    console.log('✓ Audio file uploaded successfully');
    console.log('  - File ID:', uploadedFileId);
    console.log('  - Filename:', uploadResponse.data.file.filename);
    console.log('  - Size:', (uploadResponse.data.file.size / 1024 / 1024).toFixed(2) + 'MB');
    console.log('  - Status:', uploadResponse.data.file.status);
    
    console.log('\n2. Testing transcription processing...');
    const transcribeResponse = await axios.post(`${baseUrl}/test/transcription/${uploadedFileId}/transcribe`, {
      language: 'en-US',
      enableAutomaticPunctuation: true
    });
    transcriptionId = transcribeResponse.data.transcription.id;
    console.log('✓ Transcription completed successfully');
    console.log('  - Transcription ID:', transcriptionId);
    console.log('  - Confidence:', (transcribeResponse.data.transcription.confidence * 100).toFixed(1) + '%');
    console.log('  - Word count:', transcribeResponse.data.transcription.word_count);
    console.log('  - Language:', transcribeResponse.data.transcription.language);
    console.log('  - Text preview:', transcribeResponse.data.transcription.text.substring(0, 100) + '...');
    
    console.log('\n3. Testing transcription retrieval...');
    const getResponse = await axios.get(`${baseUrl}/test/transcription/${transcriptionId}`);
    console.log('✓ Transcription retrieved successfully');
    console.log('  - Status:', getResponse.data.data.status);
    console.log('  - Provider:', getResponse.data.data.provider);
    console.log('  - Full text:', getResponse.data.data.text);
    
    console.log('\n4. Testing detailed transcription data...');
    const detailsResponse = await axios.get(`${baseUrl}/test/transcription/${transcriptionId}/details`);
    console.log('✓ Detailed transcription data retrieved');
    console.log('  - Word count:', detailsResponse.data.data.stats.word_count);
    console.log('  - Character count:', detailsResponse.data.data.stats.character_count);
    console.log('  - Estimated duration:', detailsResponse.data.data.stats.estimated_duration + 's');
    console.log('  - Word-level timestamps:', detailsResponse.data.data.words.length + ' words');
    
    if (detailsResponse.data.data.words.length > 0) {
      const firstWord = detailsResponse.data.data.words[0];
      console.log('  - Sample word timing:', `"${firstWord.word}" (${firstWord.startTime}s-${firstWord.endTime}s, ${(firstWord.confidence * 100).toFixed(1)}%)`);
    }
    
    console.log('\n5. Testing transcriptions listing...');
    const listResponse = await axios.get(`${baseUrl}/test/transcriptions`);
    console.log('✓ Transcriptions list retrieved');
    console.log('  - Total transcriptions:', listResponse.data.data.length);
    if (listResponse.data.data.length > 0) {
      console.log('  - Latest transcription:', listResponse.data.data[0].text.substring(0, 50) + '...');
    }
    
    console.log('\n6. Testing transcription search...');
    const searchResponse = await axios.post(`${baseUrl}/test/transcriptions/search`, {
      query: 'test'
    });
    console.log('✓ Transcription search completed');
    console.log('  - Search query: "test"');
    console.log('  - Results found:', searchResponse.data.results);
    if (searchResponse.data.data.length > 0) {
      console.log('  - First result:', searchResponse.data.data[0].text.substring(0, 80) + '...');
    }
    
    console.log('\n7. Testing transcription deletion...');
    const deleteResponse = await axios.delete(`${baseUrl}/test/transcription/${transcriptionId}`);
    console.log('✓ Transcription deleted successfully');
    console.log('  - Message:', deleteResponse.data.message);
    
    console.log('\n8. Verifying deletion...');
    try {
      await axios.get(`${baseUrl}/test/transcription/${transcriptionId}`);
      console.log('❌ Transcription still exists after deletion');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✓ Transcription properly deleted (404 not found)');
      } else {
        console.log('⚠️  Unexpected error verifying deletion:', error.response?.status);
      }
    }
    
    console.log('\n🎉 Audio transcription tests completed successfully!');
    console.log('\nFeatures demonstrated:');
    console.log('✓ Audio file upload and storage');
    console.log('✓ Speech-to-text transcription');
    console.log('✓ Confidence scoring');
    console.log('✓ Word-level timestamps');
    console.log('✓ Text search across transcriptions');
    console.log('✓ Detailed transcription metadata');
    console.log('✓ Transcription management (CRUD)');
    console.log('✓ Mock Google Cloud Speech integration');
    
    console.log('\n📋 Production endpoints (with authentication):');
    console.log('  POST /transcription/upload - Upload audio file');
    console.log('  POST /transcription/:id/transcribe - Start transcription');
    console.log('  GET /transcription/:id - Get transcription result');
    console.log('  GET /transcriptions - Get all transcriptions');
    console.log('  POST /transcriptions/search - Search transcriptions');
    console.log('  GET /transcription/:id/details - Get detailed results');
    console.log('  DELETE /transcription/:id - Delete transcription');
    
  } catch (error) {
    console.error('❌ Audio transcription test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}, 2000); 