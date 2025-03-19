const speech = require('@google-cloud/speech');

module.exports = ({ providerVars, providerName }) => {
  const NAME = providerName;
  const ENV = providerVars;

  // Create a client with Google credentials
  let client;
  try {
    client = new speech.SpeechClient({
      credentials: ENV.credentials ? JSON.parse(ENV.credentials) : undefined,
      keyFilename: ENV.keyFilename
    });
  } catch (err) {
    console.error(`Error initializing Google Speech client: ${err.message}`);
    throw err;
  }

  return {
    NAME,
    ENV,

    /**
     * Transcribe audio from a file
     * @param {Object} options - Transcription options
     * @param {Buffer|string} options.audio - Audio buffer or file path
     * @param {string} [options.encoding='LINEAR16'] - Audio encoding
     * @param {number} [options.sampleRateHertz=16000] - Sample rate in hertz
     * @param {string} [options.languageCode='en-US'] - Language code
     * @param {boolean} [options.enableAutomaticPunctuation=true] - Enable automatic punctuation
     * @param {boolean} [options.enableWordTimeOffsets=false] - Enable word time offsets
     * @returns {Promise<Object>} Transcription result
     */
    transcribe: async ({ 
      audio, 
      encoding = 'LINEAR16',
      sampleRateHertz = 16000,
      languageCode = 'en-US',
      enableAutomaticPunctuation = true,
      enableWordTimeOffsets = false
    }) => {
      try {
        let audioContent;
        
        // Handle audio input (Buffer or file path)
        if (Buffer.isBuffer(audio)) {
          audioContent = { content: audio.toString('base64') };
        } else if (typeof audio === 'string') {
          // Assuming it's a file path
          const fs = require('fs');
          const content = fs.readFileSync(audio);
          audioContent = { content: content.toString('base64') };
        } else {
          throw new Error('Audio must be a Buffer or file path');
        }

        const request = {
          audio: audioContent,
          config: {
            encoding,
            sampleRateHertz,
            languageCode,
            enableAutomaticPunctuation,
            enableWordTimeOffsets,
          },
        };

        const [response] = await client.recognize(request);
        return {
          success: true,
          results: response.results,
          text: response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n')
        };
      } catch (err) {
        console.error(`Transcription error: ${err.message}`);
        return {
          success: false,
          error: err.message
        };
      }
    }
  };
}; 