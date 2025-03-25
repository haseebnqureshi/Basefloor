// Example route file for transcription service
// This would typically be in your project's routes directory

module.exports = (API) => {
  
  // Simple GET endpoint to check if transcription service is available
  API.get('/api/transcription/status', (req, res) => {
    if (API.Transcription && API.Transcription.enabled) {
      res.json({ 
        status: 'available',
        provider: API.Transcription.Provider?.NAME || 'none'
      });
    } else {
      res.json({ status: 'unavailable' });
    }
  });

  // Endpoint to transcribe audio from a file upload
  API.post('/api/transcription/transcribe', API.Files.Middlewares.upload, async (req, res) => {
    try {
      // Check if transcription service is enabled
      if (!API.Transcription || !API.Transcription.enabled) {
        return res.status(503).json({ error: 'Transcription service not enabled' });
      }

      // Check if file was uploaded
      if (!req.files || !req.files.audio) {
        return res.status(400).json({ error: 'No audio file uploaded' });
      }

      const audioFile = req.files.audio.path;
      
      // Get language from query params or use default
      const languageCode = req.query.language || 'en-US';
      
      // Call the transcription service
      const result = await API.Transcription.Provider.transcribe({
        audio: audioFile,
        languageCode,
        // Optional parameters can be passed from client
        sampleRateHertz: req.query.sampleRate ? parseInt(req.query.sampleRate) : 16000,
        encoding: req.query.encoding || 'LINEAR16',
        enableAutomaticPunctuation: req.query.punctuation !== 'false'
      });

      // Return the transcription result
      res.json(result);
      
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ 
        error: 'Transcription failed', 
        message: error.message 
      });
    }
  });

  // Return API to continue the chain
  return API;
}; 