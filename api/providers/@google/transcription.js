const speech = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');

module.exports = ({ providerVars, providerName }) => {
  const NAME = providerName;
  const ENV = providerVars;

  // Supported audio formats for Google Speech-to-Text
  // Maps file extensions to encoding type
  const SUPPORTED_FORMATS = {
    '.wav': 'LINEAR16',
    '.flac': 'FLAC',
    '.mp3': 'MP3',
    '.ogg': 'OGG_OPUS',
    '.oga': 'OGG_OPUS',
    '.opus': 'OGG_OPUS',
    '.webm': 'WEBM_OPUS',
    '.m4a': 'MP4',
    '.aac': 'AAC',
    '.amr': 'AMR',
    '.awb': 'AMR_WB',
    '.spx': 'SPEEX'
  };

  // Sample rates typically used (in hertz)
  const SAMPLE_RATES = {
    '.wav': 16000,
    '.flac': 16000,
    '.mp3': 16000,
    '.ogg': 16000,
    '.oga': 16000,
    '.opus': 16000,
    '.webm': 16000,
    '.m4a': 16000,
    '.aac': 16000,
    '.amr': 8000,
    '.awb': 16000,
    '.spx': 16000
  };

  // Create a client with Google credentials
  let client;
  try {
    let credentials;
    
    // Handle base64 encoded credentials
    if (ENV.credentials_base64) {
      credentials = JSON.parse(Buffer.from(ENV.credentials_base64, 'base64').toString());
    }
    // Handle JSON string credentials
    else if (ENV.credentials) {
      credentials = JSON.parse(ENV.credentials);
    }

    client = new speech.SpeechClient({
      credentials: credentials,
      keyFilename: ENV.keyFilename
    });
  } catch (err) {
    console.error(`Error initializing Google Speech client: ${err.message}`);
    throw err;
  }

  /**
   * Check if the audio file format is supported
   * @param {string} filePath - Path to the audio file
   * @returns {Object} Object containing encoding and sample rate if supported
   * @throws {Error} If format is not supported
   */
  function checkFileFormat(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (!SUPPORTED_FORMATS[ext]) {
      throw new Error(
        `Unsupported audio format: ${ext}\n` +
        `Supported formats are: ${Object.keys(SUPPORTED_FORMATS).join(', ')}`
      );
    }
    
    return {
      encoding: SUPPORTED_FORMATS[ext],
      sampleRateHertz: SAMPLE_RATES[ext]
    };
  }

  return {
    NAME,
    ENV,
    SUPPORTED_FORMATS,
    SAMPLE_RATES,

    /**
     * Transcribe audio from a file
     * @param {Object} options - Transcription options
     * @param {Buffer|string} options.audio - Audio buffer or file path
     * @param {string} [options.encoding] - Audio encoding (auto-detected from file extension if not provided)
     * @param {number} [options.sampleRateHertz] - Sample rate in hertz (defaults based on format if not provided)
     * @param {string} [options.languageCode='en-US'] - Language code
     * @param {boolean} [options.enableAutomaticPunctuation=true] - Enable automatic punctuation
     * @param {boolean} [options.enableWordTimeOffsets=false] - Enable word time offsets
     * @returns {Promise<Object>} Transcription result
     */
    transcribe: async ({ 
      audio, 
      encoding,
      sampleRateHertz,
      languageCode = 'en-US',
      enableAutomaticPunctuation = true,
      enableWordTimeOffsets = false
    }) => {
      try {
        let audioContent;
        let formatInfo = {};
        
        // Handle audio input (Buffer or file path)
        if (Buffer.isBuffer(audio)) {
          audioContent = { content: audio.toString('base64') };
          
          // For buffers, encoding and sample rate must be provided
          if (!encoding) {
            throw new Error('For Buffer inputs, encoding must be specified');
          }
          if (!sampleRateHertz) {
            throw new Error('For Buffer inputs, sampleRateHertz must be specified');
          }
        } else if (typeof audio === 'string') {
          // It's a file path - check format and get default encoding/sample rate if not provided
          if (!fs.existsSync(audio)) {
            throw new Error(`Audio file not found: ${audio}`);
          }
          
          formatInfo = checkFileFormat(audio);
          
          const content = fs.readFileSync(audio);
          audioContent = { content: content.toString('base64') };
        } else {
          throw new Error('Audio must be a Buffer or file path');
        }

        const request = {
          audio: audioContent,
          config: {
            encoding: encoding || formatInfo.encoding,
            sampleRateHertz: sampleRateHertz || formatInfo.sampleRateHertz,
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