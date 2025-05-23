# Audio Transcription

The transcription service enables speech-to-text capabilities in your Basefloor application. Currently, it supports Google Cloud Speech-to-Text as a provider.

## Setup

### 1. Configure Google Cloud credentials

1. Create a Google Cloud project (or use an existing one)
2. Enable the Speech-to-Text API in your Google Cloud project
3. Create a service account with access to Speech-to-Text API
4. Download the service account key (JSON file)
5. Store this file securely (never commit it to version control)

### 2. Configure in basefloor.config.js

```javascript
module.exports = (API) => {
  return {
    // Other configurations...

    // Enable transcription service
    transcription: {
      enabled: true,
      provider: '@google/transcription',
    },

    // Provider configuration
    providers: {
      '@google/transcription': {
        // Option 1: Path to credentials file
        keyFilename: '/path/to/your-google-credentials.json',
        
        // OR Option 2: JSON string (e.g., from environment variable)
        // credentials: process.env.GOOGLE_CREDENTIALS_JSON,
      },
    },

    // Other configurations...
  };
};
```

## Supported Audio Formats

The Google transcription provider supports the following audio formats:

| File Extension | Encoding Type | Default Sample Rate |
|----------------|--------------|-------------|
| .wav | LINEAR16 | 16000 Hz |
| .flac | FLAC | 16000 Hz |
| .mp3 | MP3 | 16000 Hz |
| .ogg, .oga, .opus | OGG_OPUS | 16000 Hz |
| .webm | WEBM_OPUS | 16000 Hz |
| .m4a | MP4 | 16000 Hz |
| .aac | AAC | 16000 Hz |
| .amr | AMR | 8000 Hz |
| .awb | AMR_WB | 16000 Hz |
| .spx | SPEEX | 16000 Hz |

The provider will automatically detect the format based on the file extension and use the appropriate encoding and sample rate.

## Testing

To test the transcription service, you can use the included test script:

1. Update `test-transcription.js` with the path to your Google credentials file
2. Run the test script:

```bash
node test-transcription.js
```

This will:
1. Generate a test audio file using macOS `say` command
2. Transcribe it using the Google Speech-to-Text API
3. Show you the transcription results

## Usage in your API

The transcription service adds an `API.Transcription` object to your Basefloor instance with the following methods:

```javascript
// Example route to transcribe an audio file
app.post('/api/transcribe', async (req, res) => {
  try {
    // Assuming the audio file path is provided in the request
    const audioFilePath = req.body.audioFilePath;
    
    // Call the transcription service
    const result = await API.Transcription.Provider.transcribe({
      audio: audioFilePath,
      // No need to specify encoding or sample rate for file paths
      // They're automatically detected from the file extension
      languageCode: 'en-US', // Optional, defaults to 'en-US'
    });
    
    // Send the transcription result
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Transcription Parameters

The `transcribe` method accepts the following parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| audio | Buffer/String | (required) | Audio buffer or file path |
| encoding | String | (auto-detected) | Audio encoding format (required for Buffer input) |
| sampleRateHertz | Number | (auto-detected) | Sample rate in hertz (required for Buffer input) |
| languageCode | String | 'en-US' | Language code |
| enableAutomaticPunctuation | Boolean | true | Enable automatic punctuation |
| enableWordTimeOffsets | Boolean | false | Enable word time offsets |

When providing a file path, the encoding and sample rate are automatically detected based on the file extension. When providing a buffer, you must specify the encoding and sample rate explicitly.

For more details on these parameters, see the [Google Speech-to-Text documentation](https://cloud.google.com/speech-to-text/docs/reference/rest/v1/RecognitionConfig). 