# Transcription Service

The Transcription service enables speech-to-text transcription capabilities in your Basefloor application through various provider integrations.

## Overview

The Transcription module provides audio-to-text conversion capabilities, allowing you to transcribe audio files, voice recordings, and real-time speech. It supports multiple providers and can be configured for single or multi-provider setups.

⚠️ **Security Warning**: When deploying this service, never expose credentials in your codebase. Always use environment variables and ensure proper credential management.

## Configuration

### Single Provider Setup

Configure a single transcription provider in your `basefloor.config.js`:

```javascript
module.exports = (API) => {
  return {
    transcription: {
      enabled: true,
      provider: '@google/transcription',
    },
    providers: {
      '@google/transcription': {
        // Option 1 (Recommended for production): Base64 encoded credentials
        credentials_base64: process.env.GOOGLE_CREDENTIALS_BASE64,
        
        // OR Option 2: JSON string credentials
        // credentials: process.env.GOOGLE_CREDENTIALS_JSON,
        
        // OR Option 3: Path to credentials file (Development only)
        // keyFilename: './google-credentials.json',
      },
    },
  }
}
```

### Multiple Providers Setup

Configure multiple transcription providers for different use cases:

```javascript
module.exports = (API) => {
  return {
    transcription: {
      enabled: true,
      providers: {
        'Primary': '@google/transcription',
        'Backup': '@azure/transcription', // When available
      },
    },
    providers: {
      '@google/transcription': {
        credentials_base64: process.env.GOOGLE_CREDENTIALS_BASE64,
      },
      '@azure/transcription': {
        apiKey: process.env.AZURE_SPEECH_KEY,
        region: process.env.AZURE_SPEECH_REGION,
      },
    },
  }
}
```

## Usage

### Single Provider

When using a single provider, access transcription functionality directly:

```javascript
// Example transcription route
app.post('/api/transcribe', async (req, res) => {
  try {
    // Get audio file from request (using multer or similar)
    const audioFile = req.files.audio.path;
    
    // Transcribe the audio
    const result = await API.Transcription.Provider.transcribe({
      audio: audioFile,
      languageCode: 'en-US', // Optional, defaults to 'en-US'
      sampleRateHertz: 16000, // Optional, defaults to 16000
      encoding: 'LINEAR16', // Optional, defaults to 'LINEAR16'
    });
    
    // Return the transcription
    res.json({
      transcript: result.transcript,
      confidence: result.confidence,
      words: result.words, // If word-level timing enabled
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Multiple Providers

When using multiple providers, access each by its configured name:

```javascript
// Use primary provider for high-quality transcription
const primaryResult = await API.Transcription.Primary.transcribe({
  audio: audioBuffer,
  languageCode: 'en-US',
  enableAutomaticPunctuation: true,
});

// Use backup provider if primary fails
const backupResult = await API.Transcription.Backup.transcribe({
  audio: audioBuffer,
  languageCode: 'en-US',
});
```

### Real-time Transcription

For streaming audio transcription:

```javascript
// WebSocket example for real-time transcription
const WebSocket = require('ws');

app.ws('/transcribe-stream', (ws, req) => {
  let transcriptionStream;

  ws.on('message', async (audioChunk) => {
    try {
      if (!transcriptionStream) {
        transcriptionStream = API.Transcription.Provider.createStream({
          languageCode: 'en-US',
          sampleRateHertz: 16000,
          encoding: 'LINEAR16',
        });

        transcriptionStream.on('data', (result) => {
          ws.send(JSON.stringify({
            transcript: result.transcript,
            isFinal: result.isFinal,
          }));
        });
      }

      transcriptionStream.write(audioChunk);
    } catch (error) {
      ws.send(JSON.stringify({ error: error.message }));
    }
  });

  ws.on('close', () => {
    if (transcriptionStream) {
      transcriptionStream.end();
    }
  });
});
```

## Available Providers

### Google Cloud Speech-to-Text (@google/transcription)

Google's Speech-to-Text API provides high-accuracy transcription with support for multiple languages and audio formats.

**Configuration Options:**
```javascript
providers: {
  '@google/transcription': {
    // Recommended: Base64 encoded service account credentials
    credentials_base64: process.env.GOOGLE_CREDENTIALS_BASE64,
    
    // Alternative: JSON string credentials
    credentials: process.env.GOOGLE_CREDENTIALS_JSON,
    
    // Development only: Path to credentials file
    keyFilename: './path/to/credentials.json',
    
    // Optional: Custom project ID
    projectId: 'your-gcp-project-id',
  },
}
```

**Methods:**
- `transcribe(options)` - Transcribe audio file or buffer
- `createStream(options)` - Create streaming transcription

**Transcription Options:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `audio` | Buffer/String | (required) | Audio buffer or file path |
| `encoding` | String | 'LINEAR16' | Audio encoding format |
| `sampleRateHertz` | Number | 16000 | Sample rate in hertz |
| `languageCode` | String | 'en-US' | Language code |
| `enableAutomaticPunctuation` | Boolean | true | Enable automatic punctuation |
| `enableWordTimeOffsets` | Boolean | false | Enable word time offsets |
| `maxAlternatives` | Number | 1 | Maximum alternative transcriptions |
| `profanityFilter` | Boolean | false | Filter profanity |
| `speechContexts` | Array | [] | Speech adaptation contexts |

**Example:**
```javascript
const result = await API.Transcription.Provider.transcribe({
  audio: './audio/recording.wav',
  languageCode: 'en-US',
  enableAutomaticPunctuation: true,
  enableWordTimeOffsets: true,
  maxAlternatives: 3,
  speechContexts: [
    {
      phrases: ['technical terms', 'API', 'Basefloor'],
      boost: 20.0
    }
  ]
});

console.log('Transcript:', result.transcript);
console.log('Confidence:', result.confidence);
console.log('Words with timing:', result.words);
```

## Credentials Setup

### Production Setup (Recommended)

1. **Create Google Cloud Service Account:**
   - Go to Google Cloud Console
   - Create a new service account
   - Download the JSON credentials file

2. **Convert credentials to base64:**
   ```bash
   # On Mac/Linux:
   base64 -i google-credentials.json
   
   # On Windows (PowerShell):
   [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("google-credentials.json"))
   ```

3. **Set environment variable:**
   ```bash
   export GOOGLE_CREDENTIALS_BASE64="eyJ0eXBlIjoic2VydmljZV9hY2NvdW50Ii..."
   ```

### Development Setup

For local development:

```bash
# .env file
GOOGLE_CREDENTIALS_BASE64="your-base64-encoded-credentials"

# Or use file path (less secure)
GOOGLE_CREDENTIALS_PATH="./google-credentials.json"
```

⚠️ **Important Security Notes:**
- Never commit credentials to version control
- Add credential files to `.gitignore`
- Rotate credentials if they are ever exposed
- Use secure environment variable management in production

## Audio Format Support

### Supported Formats

Google Speech-to-Text supports various audio formats:

- **LINEAR16**: Uncompressed 16-bit signed little-endian samples
- **FLAC**: Free Lossless Audio Codec
- **MULAW**: 8-bit samples that use μ-law encoding
- **AMR**: Adaptive Multi-Rate Narrowband codec
- **AMR_WB**: Adaptive Multi-Rate Wideband codec
- **OGG_OPUS**: Opus encoded audio frames in Ogg container
- **SPEEX_WITH_HEADER_BYTE**: Speex wideband codec

### Audio Preprocessing

```javascript
// Example with ffmpeg for audio conversion
const ffmpeg = require('fluent-ffmpeg');

const convertAudio = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('pcm_s16le')
      .audioFrequency(16000)
      .audioChannels(1)
      .format('wav')
      .save(outputPath)
      .on('end', resolve)
      .on('error', reject);
  });
};

// Usage
await convertAudio('./input.mp3', './output.wav');
const result = await API.Transcription.Provider.transcribe({
  audio: './output.wav',
  encoding: 'LINEAR16',
  sampleRateHertz: 16000,
});
```

## Language Support

Google Speech-to-Text supports over 125 languages and variants:

```javascript
// Common language codes
const languages = {
  'en-US': 'English (United States)',
  'en-GB': 'English (United Kingdom)',
  'es-ES': 'Spanish (Spain)',
  'fr-FR': 'French (France)',
  'de-DE': 'German (Germany)',
  'ja-JP': 'Japanese (Japan)',
  'ko-KR': 'Korean (South Korea)',
  'zh-CN': 'Chinese (Simplified)',
  'pt-BR': 'Portuguese (Brazil)',
  'it-IT': 'Italian (Italy)',
};

// Multi-language transcription
const result = await API.Transcription.Provider.transcribe({
  audio: audioFile,
  languageCode: 'en-US',
  alternativeLanguageCodes: ['es-ES', 'fr-FR'], // Fallback languages
});
```

## Error Handling

The transcription service includes comprehensive error handling:

```javascript
try {
  const result = await API.Transcription.Provider.transcribe(options);
  console.log('Transcription successful:', result.transcript);
} catch (error) {
  console.error('Transcription error:', error.message);
  
  // Handle specific error types
  if (error.code === 'INVALID_ARGUMENT') {
    console.error('Invalid audio format or parameters');
  } else if (error.code === 'PERMISSION_DENIED') {
    console.error('Authentication failed - check credentials');
  } else if (error.code === 'QUOTA_EXCEEDED') {
    console.error('API quota exceeded');
  }
}
```

## Environment Variables

Required environment variables:

```bash
# Google Cloud Speech-to-Text
GOOGLE_CREDENTIALS_BASE64=your_base64_encoded_credentials

# Alternative credential methods
GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Optional: Custom project ID
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

## Dependencies

Install required dependencies:

```bash
# Google Cloud Speech-to-Text
npm install @google-cloud/speech --save

# Optional: Audio processing
npm install fluent-ffmpeg --save
npm install multer --save  # For file uploads
```

The system will automatically check for required dependencies and provide installation instructions if any are missing.

## Performance Optimization

### Batch Processing

For multiple files:

```javascript
const transcribeMultiple = async (audioFiles) => {
  const results = await Promise.all(
    audioFiles.map(file => 
      API.Transcription.Provider.transcribe({
        audio: file,
        languageCode: 'en-US',
      })
    )
  );
  return results;
};
```

### Caching Results

```javascript
const NodeCache = require('node-cache');
const transcriptionCache = new NodeCache({ stdTTL: 3600 }); // 1 hour

const transcribeWithCache = async (audioFile) => {
  const fileHash = crypto.createHash('md5')
    .update(fs.readFileSync(audioFile))
    .digest('hex');
  
  let result = transcriptionCache.get(fileHash);
  if (!result) {
    result = await API.Transcription.Provider.transcribe({
      audio: audioFile,
      languageCode: 'en-US',
    });
    transcriptionCache.set(fileHash, result);
  }
  
  return result;
};
```

## Best Practices

1. **Audio Quality**: Use high-quality audio (16kHz+, clear speech)
2. **File Size**: Keep audio files under 10MB for synchronous requests
3. **Language Detection**: Specify the correct language code for better accuracy
4. **Speech Contexts**: Use speech contexts for domain-specific terminology
5. **Error Handling**: Implement robust error handling and retries
6. **Caching**: Cache results to avoid redundant API calls
7. **Rate Limiting**: Respect API rate limits and quotas
8. **Security**: Never expose credentials in client-side code

## Testing

### Unit Tests

```javascript
// Example test
describe('Transcription Service', () => {
  it('should transcribe audio file', async () => {
    const result = await API.Transcription.Provider.transcribe({
      audio: './test/fixtures/sample.wav',
      languageCode: 'en-US',
    });
    
    expect(result.transcript).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0.8);
  });
});
```

### Integration Tests

```javascript
// Test with actual audio file
const testTranscription = async () => {
  try {
    const result = await API.Transcription.Provider.transcribe({
      audio: './test-audio.wav',
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
    });
    
    console.log('Test successful:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
};
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Verify credentials are correctly encoded
   - Check service account permissions
   - Ensure Speech-to-Text API is enabled

2. **Audio Format Issues**:
   - Verify audio encoding matches configuration
   - Check sample rate and channel count
   - Ensure audio file is not corrupted

3. **Quota Exceeded**:
   - Check Google Cloud Console for usage limits
   - Implement rate limiting in your application
   - Consider upgrading your quota

4. **Low Accuracy**:
   - Use higher quality audio
   - Specify correct language code
   - Add speech contexts for technical terms

### Debug Mode

Enable detailed logging:

```javascript
// Enable debug logging
process.env.GOOGLE_CLOUD_DEBUG = 'true';

// Custom logging
const result = await API.Transcription.Provider.transcribe({
  audio: audioFile,
  languageCode: 'en-US',
  debug: true, // Custom debug flag
});
```

### Missing Dependencies

The system will provide specific installation commands:

```bash
# Example error message
Missing required dependencies for @google/transcription:
Please run 'npm install @google-cloud/speech --save' in the Basefloor directory
``` 