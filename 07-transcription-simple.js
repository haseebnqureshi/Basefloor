/**
 * Simple Audio Transcription Example - No Database Required
 * 
 * This is a simplified version that works with just the minimal .env
 * Perfect for testing transcription functionality without complex setup
 */
require('dotenv').config();
const api = require('../../packages/api');

const API = api({
  projectPath: __dirname,
  envPath: './.env'
});

// Initialize the API
API.Init();

// In-memory storage for demo (no database required!)
const audioFiles = new Map();
const transcriptions = new Map();
let nextId = 1;

/**
 * Upload audio file for transcription (Mock - No real file upload)
 */
API.post('/test/transcription/upload', async (req, res) => {
  try {
    const audioRecord = {
      _id: 'audio_' + nextId++,
      filename: 'audio_' + Date.now() + '.mp3',
      originalName: 'test_audio.wav',
      size: 147216, // Size of our test file
      mimetype: 'audio/wav',
      path: '/uploads/test_audio.wav',
      url: '/files/test_audio.wav',
      user_id: 'test-user',
      status: 'uploaded',
      created_at: new Date()
    };
    
    audioFiles.set(audioRecord._id, audioRecord);
    
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
 */
API.post('/test/transcription/:id/transcribe', async (req, res) => {
  try {
    const audioFile = audioFiles.get(req.params.id);
    
    if (!audioFile) {
      return res.status(404).json({ error: 'Audio file not found' });
    }
    
    const { language = 'en-US', enableAutomaticPunctuation = true } = req.body;
    
    // Mock transcription result based on our test audio
    const transcriptionResult = {
      text: "The birch canoe slid on the smooth planks. Glue the sheet to the dark blue background.",
      confidence: 0.96,
      words: [
        { word: 'The', startTime: 0.1, endTime: 0.3, confidence: 0.99 },
        { word: 'birch', startTime: 0.4, endTime: 0.7, confidence: 0.98 },
        { word: 'canoe', startTime: 0.8, endTime: 1.1, confidence: 0.97 },
        { word: 'slid', startTime: 1.2, endTime: 1.4, confidence: 0.96 },
        { word: 'on', startTime: 1.5, endTime: 1.6, confidence: 0.99 },
        { word: 'the', startTime: 1.7, endTime: 1.9, confidence: 0.98 },
        { word: 'smooth', startTime: 2.0, endTime: 2.4, confidence: 0.97 },
        { word: 'planks', startTime: 2.5, endTime: 2.9, confidence: 0.96 }
      ]
    };
    
    const transcription = {
      _id: 'transcription_' + nextId++,
      audio_file_id: audioFile._id,
      user_id: 'test-user',
      language,
      text: transcriptionResult.text,
      confidence: transcriptionResult.confidence,
      words: transcriptionResult.words,
      status: 'completed',
      provider: 'mock-google-speech',
      created_at: new Date()
    };
    
    transcriptions.set(transcription._id, transcription);
    
    // Update audio file status
    audioFile.status = 'transcribed';
    audioFile.transcription_id = transcription._id;
    
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
API.get('/test/transcription/:id', async (req, res) => {
  try {
    const transcription = transcriptions.get(req.params.id);
    
    if (!transcription) {
      return res.status(404).json({ error: 'Transcription not found' });
    }
    
    res.json({ success: true, data: transcription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all transcriptions
API.get('/test/transcriptions', async (req, res) => {
  try {
    const allTranscriptions = Array.from(transcriptions.values())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50);
    
    res.json({ success: true, data: allTranscriptions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search transcriptions
API.post('/test/transcriptions/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = Array.from(transcriptions.values())
      .filter(t => t.text.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json({ 
      success: true, 
      data: results,
      query,
      results: results.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transcription details with word-level timestamps
API.get('/test/transcription/:id/details', async (req, res) => {
  try {
    const transcription = transcriptions.get(req.params.id);
    
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
          estimated_duration: transcription.words.length * 0.4 // rough estimate
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete transcription
API.delete('/test/transcription/:id', async (req, res) => {
  try {
    if (!transcriptions.has(req.params.id)) {
      return res.status(404).json({ error: 'Transcription not found' });
    }
    
    transcriptions.delete(req.params.id);
    res.json({ success: true, message: 'Transcription deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.Start();

console.log('🎤 Simple Audio Transcription API running!');
console.log('📍 Server: http://localhost:' + (process.env.PORT || 4000));
console.log('🧪 Testing endpoints...\n');

// Auto-test the API
setTimeout(async () => {
  const baseUrl = `http://localhost:${process.env.PORT || 4000}`;
  const axios = require('axios');
  
  try {
    console.log('1. Testing audio file upload...');
    const uploadResponse = await axios.post(`${baseUrl}/test/transcription/upload`);
    const fileId = uploadResponse.data.file._id;
    console.log('✅ Upload successful - File ID:', fileId);
    
    console.log('\n2. Testing transcription...');
    const transcribeResponse = await axios.post(`${baseUrl}/test/transcription/${fileId}/transcribe`, {
      language: 'en-US',
      enableAutomaticPunctuation: true
    });
    const transcriptionId = transcribeResponse.data.transcription.id;
    console.log('✅ Transcription completed - ID:', transcriptionId);
    console.log('📝 Text:', transcribeResponse.data.transcription.text);
    console.log('🎯 Confidence:', (transcribeResponse.data.transcription.confidence * 100).toFixed(1) + '%');
    
    console.log('\n3. Testing transcription retrieval...');
    const getResponse = await axios.get(`${baseUrl}/test/transcription/${transcriptionId}`);
    console.log('✅ Retrieved transcription successfully');
    
    console.log('\n4. Testing detailed view...');
    const detailsResponse = await axios.get(`${baseUrl}/test/transcription/${transcriptionId}/details`);
    console.log('✅ Word-level details retrieved');
    console.log('📊 Stats:', detailsResponse.data.data.stats);
    
    console.log('\n🎉 All tests passed! API is working perfectly.');
    console.log('\n🚀 Try these endpoints:');
    console.log(`   POST ${baseUrl}/test/transcription/upload`);
    console.log(`   POST ${baseUrl}/test/transcription/{id}/transcribe`);
    console.log(`   GET  ${baseUrl}/test/transcription/{id}`);
    console.log(`   GET  ${baseUrl}/test/transcriptions`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}, 1000); 