# Transcription Service for MinAPI

This service enables speech-to-text transcription capabilities in your MinAPI application.

## Supported Providers

- `@google/transcription`: Google Cloud Speech-to-Text API

## Setup

### 1. Install the required dependencies

```bash
npm install @google-cloud/speech --save
```

### 2. Configure in minapi.config.js

Add the transcription configuration to your `minapi.config.js` file:

```javascript
// In minapi.config.js

module.exports = (API) => {
  return {
    // ... other configurations
    
    // Transcription service configuration
    transcription: {
      enabled: true,
      provider: '@google/transcription',
    },
    
    // Provider-specific configuration
    providers: {
      '@google/transcription': {
        // Option 1: Provide credentials JSON directly
        credentials: process.env.GOOGLE_CREDENTIALS_JSON,
        
        // OR Option 2: Provide path to credentials JSON file
        keyFilename: './google-credentials.json',
      },
    },
    
    // ... other configurations
  }
}
```

## Usage

Once configured, you can use the transcription service in your routes:

```javascript
// Example transcription route
app.post('/api/transcribe', async (req, res) => {
  try {
    // Get audio file from request
    const audioFile = req.files.audio.path;
    
    // Transcribe the audio
    const result = await API.Transcription.Provider.transcribe({
      audio: audioFile,
      languageCode: 'en-US', // Optional, defaults to 'en-US'
      sampleRateHertz: 16000, // Optional, defaults to 16000
      encoding: 'LINEAR16', // Optional, defaults to 'LINEAR16'
    });
    
    // Return the transcription
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Configuration Options

### Google Transcription Provider

The Google provider accepts the following options:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `audio` | Buffer/String | (required) | Audio buffer or file path |
| `encoding` | String | 'LINEAR16' | Audio encoding format |
| `sampleRateHertz` | Number | 16000 | Sample rate in hertz |
| `languageCode` | String | 'en-US' | Language code |
| `enableAutomaticPunctuation` | Boolean | true | Enable automatic punctuation |
| `enableWordTimeOffsets` | Boolean | false | Enable word time offsets |

For more information on Google's Speech-to-Text service and its options, see the [official documentation](https://cloud.google.com/speech-to-text/docs).

## Authentication

To use Google's Speech-to-Text service, you need to set up authentication:

1. Create a Google Cloud project and enable the Speech-to-Text API
2. Create a service account and download the credentials JSON file
3. Either store the JSON content in an environment variable or provide the path to the JSON file

More details can be found in the [Google Cloud documentation](https://cloud.google.com/speech-to-text/docs/quickstart-client-libraries). 