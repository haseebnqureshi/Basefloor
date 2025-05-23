# Transcription Service for MinAPI

This service enables speech-to-text transcription capabilities in your MinAPI application.

⚠️ **SECURITY WARNING**
When publishing this package:
- NEVER publish credentials to npm
- Ensure your .npmignore excludes all credential files
- Check that no sensitive files are included before publishing with: `npm pack --dry-run`
- If credentials are ever exposed, rotate them immediately

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
        // Option 1 (Recommended for production): Base64 encoded credentials
        credentials_base64: process.env.GOOGLE_CREDENTIALS_BASE64,
        
        // OR Option 2: JSON string credentials
        // credentials: process.env.GOOGLE_CREDENTIALS_JSON,
        
        // OR Option 3: Path to credentials file (Development only)
        // keyFilename: './google-credentials.json',
      },
    },
    
    // ... other configurations
  }
}
```

## Credentials Setup

### Production Setup (Recommended)

1. Convert your Google credentials file to base64:
```bash
# On Mac/Linux:
base64 -i google-credentials.json

# On Windows (PowerShell):
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("google-credentials.json"))
```

2. Set the base64 string as an environment variable:
```bash
export GOOGLE_CREDENTIALS_BASE64="eyJ0eXBlIjoic2VydmljZV9hY2NvdW50Ii..."
```

### Development Setup

For local development, you can either:
1. Use the base64 approach above with a `.env` file
2. Place the credentials file in your project and reference it with `keyFilename`

```bash
# .env.example
GOOGLE_CREDENTIALS_BASE64="your-base64-encoded-credentials"
```

⚠️ IMPORTANT:
- Never commit credentials to version control
- Add credential files to .gitignore
- Rotate credentials if they are ever exposed
- Use secure environment variable management in production

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

To use Google's Speech-to-Text service, you need to:

1. Create a Google Cloud project
2. Enable the Speech-to-Text API
3. Create a service account with appropriate permissions
4. Download the credentials JSON file
5. Set up the credentials using one of the methods above

More details can be found in the [Google Cloud documentation](https://cloud.google.com/speech-to-text/docs/quickstart-client-libraries). 