# Getting Started

BasefloorAPI is a comprehensive API framework built on Express and MongoDB that provides a minimum viable API setup with built-in authentication, permissions, CRUD operations, and resource management.

## Features

- 🔐 Built-in Authentication & JWT
- 👥 User Management & Permissions
- 📝 CRUD Operations
- 📨 Email Notifications (Postmark integration)
- 🗄️ MongoDB Integration
- 🖼️ File Management & Image Processing
- 🎙️ Audio-to-Text Transcription
- 🔄 File Format Conversions
- 🔒 Security Features
- 📱 Phone Number Validation
- ☁️ AWS S3 Integration

## Installation

```bash
npm install basefloor
# or
yarn add basefloor
```

### System Requirements

The following system dependencies are required:

#### LibreOffice (for document processing and text-to-image conversion)
```bash
# Ubuntu
sudo apt install libreoffice

# Mac
brew install libreoffice
```

#### Ghostscript (for PDF processing)
```bash
# Mac
brew install ghostscript

# Ubuntu
sudo apt-get install ghostscript
```

#### Google Cloud SDK (for audio transcription)
To use the audio transcription features, you'll need Google Cloud credentials:

1. Create a Google Cloud project and enable the Speech-to-Text API
2. Create a service account with access to the Speech-to-Text API
3. Download the service account key file (JSON)

These need to be installed before running `npm install` or `yarn`.

## Quick Start

1. Create a new project and install Basefloor:
```bash
mkdir my-api
cd my-api
npm init -y
npm install basefloor
```

2. Create a configuration file (`basefloor.config.js`):
```javascript
module.exports = (API) => {
  return {
    mongodb: {
      uri: 'your-mongodb-uri',
    },
    jwt: {
      secret: 'your-jwt-secret',
    },
    // For audio transcription
    transcription: {
      enabled: true,
      provider: '@google/transcription',
    },
    providers: {
      '@google/transcription': {
        keyFilename: '/path/to/your-google-credentials.json',
      },
    },
    // Add other configurations as needed
  }
}
```

3. Create your main file:
```javascript
const basefloor = require('basefloor');

const api = new basefloor({
  config: require('./basefloor.config.js')
});

api.start();
```

## Next Steps

- [Installation Guide](./installation) - Detailed installation instructions
- [Configuration](./configuration) - Complete configuration reference
- [Quick Start Tutorial](./quick-start) - Build your first API 