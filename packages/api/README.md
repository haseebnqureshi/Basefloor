# BasefloorAPI

BasefloorAPI is a comprehensive API framework built on Express and MongoDB that provides a minimum viable API setup with built-in authentication, permissions, CRUD operations, and resource management.

## ✨ Key Features

- 🔐 **Built-in Authentication** - JWT, permissions, user management
- 📝 **Auto CRUD Operations** - Generate REST APIs from model definitions
- 🚀 **Smart Dependencies** - Only installs providers you actually use
- 🗄️ **MongoDB Integration** - Seamless database operations
- 📨 **Multi-Provider Email** - SendGrid, Mailgun, Postmark support
- 🤖 **AI Integration** - OpenAI, Anthropic, Google AI support
- 🖼️ **File Management** - Local, S3, Cloudinary storage options
- 🔒 **Security First** - Rate limiting, validation, sanitization

## 🚀 Smart Provider System

BasefloorAPI uses **dynamic dependency installation** - you only install what you configure:

```javascript
// Your config determines what gets installed
module.exports = (API) => ({
  email: { provider: 'sendgrid' },    // ✅ Installs sendgrid
  ai: { provider: 'openai' }          // ✅ Installs openai
  // ❌ Does NOT install: mailgun, anthropic, postmark, etc.
})
```

**Benefits:**
- 🪶 **Lightweight**: ~50% smaller node_modules
- ⚡ **Faster**: Quick installs and startup
- 🔒 **Secure**: Fewer dependencies, smaller attack surface

## Installation

```bash
npm install @basefloor/api
```

### Supported Providers

| Type | Providers | Auto-Installed |
|------|-----------|----------------|
| **Email** | SendGrid, Mailgun, Postmark, Nodemailer | Based on config |
| **AI** | OpenAI, Anthropic, Google Gemini | Based on config |
| **Storage** | AWS S3, Cloudinary, Local | Based on config |
| **Database** | MongoDB, Mongoose | Always included |

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
npm install minapi
# or
yarn add minapi
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

1. Create a new project and install MinAPI:
```bash
mkdir my-api
cd my-api
npm init -y
npm install minapi
```

2. Create a configuration file (`minapi.config.js`):
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
const MinAPI = require('minapi');

const api = new MinAPI({
  config: require('./minapi.config.js')
});

api.start();
```

## Configuration

MinAPI is configured through a `minapi.config.js` file in your project root. Here's a complete configuration reference:

```javascript
module.exports = (API) => {
  return {
    // API Name
    name: 'Your API Name',

    // Authentication Configuration
    auth: {
      // JWT configuration
      jwt: {
        expirations: {
          auth: '7d',    // Authentication token expiration
          verify: '24h', // Verification token expiration
          reset: '1h'    // Password reset token expiration
        }
      }
    },

    // Database Models Configuration
    models: [
      {
        _name: 'user',           // Model name
        _label: 'Users',         // Display label
        _collection: 'users',    // MongoDB collection name
        _values: {
          // Define model fields with their types and CRUD permissions
          email: ['string', 'c,r,u'],
          password_hash: ['string', 'c,r'],
          email_verified: ['boolean', 'c,r,u'],
          created_at: ['date', 'r'],
          updated_at: ['date', 'r']
        }
      }
    ],

    // Important: When referencing models in foreign key relationships, always use the
    // `_collection` name as the prefix for the foreign key field. For example, if a model
    // has `_collection: 'users'`, other models should reference it as `users_id`, not
    // `UserId` or `User_id`.

    // Routes Configuration
    routes: () => [
      {
        _id: '/users(user)',  // Route pattern
        _create: {
          allow: true         // Permission rules
        },
        _read: {
          allow: true,
          where: '_id'        // URL parameter mapping
        },
        _update: {
          allow: '@_user._id=@user._id'  // Permission rule example
        },
        _delete: {
          allow: false
        }
      }
    ],

    // Notification Configuration
    notifications: {
      email: {
        provider: 'postmark',
        from: 'noreply@yourdomain.com',
        templates: {
          welcomeEmail: 'template-id',
          passwordReset: 'template-id',
          emailVerification: 'template-id'
        }
      }
    },

    // File Storage Configuration
    files: {
      storage: {
        provider: 's3',    // 's3' or 'local'
        s3: {
          bucket: process.env.AWS_BUCKET,
          region: process.env.AWS_REGION
        },
        local: {
          uploadDir: './uploads'
        }
      }
    }
  }
}
```

### Environment Variables

Required environment variables:

```bash
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/your-database
MONGODB_DATABASE=your-database-name

# Authentication
JWT_SECRET=your-secure-jwt-secret

# AWS S3 (if using S3 storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_BUCKET=your-bucket-name

# Email (if using Postmark)
POSTMARK_SERVER_TOKEN=your-postmark-token

# Application
APP_NAME=Your App Name
APP_URL_VERIFY=https://your-app.com/verify/:token
APP_AUTHOR=Your Name
APP_AUTHOR_EMAIL=your@email.com
```

### Permission Rules

The `allow` property in routes supports complex permission rules:

```javascript
// Basic permission
allow: true  // Allow all
allow: false // Deny all

// Compare values
allow: '@_user._id=@user._id'  // Current user matches resource user

// Array membership
allow: 'admin=in=@_user.roles'  // User has admin role

// Logical operations
allow: {
  and: [
    '@_user._id=@user._id',
    'admin=in=@_user.roles'
  ]
}
allow: {
  or: [
    '@_user._id=@user._id',
    'admin=in=@_user.roles'
  ]
}
```

## Features in Detail

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Two-factor authentication support
- Password reset functionality
- Email verification

### File Management
- Image processing with Sharp
- AWS S3 integration for file storage
- Document processing capabilities
- Text-to-image conversion
- Audio transcription to text

### Notifications
- Email notifications via Postmark
- Customizable email templates

### Database
- MongoDB integration
- CRUD operation helpers
- Query builders
- Data validation

### File Conversion Capabilities

MinAPI provides robust file conversion capabilities:

| From | To | Provider |
|------|-----|---------|
| Documents (.doc, .docx, etc.) | PDF | LibreOffice |
| PDF | PNG images | Sharp |
| Images | Optimized PNG | Sharp |
| Audio files (.mp3, .wav, etc.) | Text (.txt) | Google Transcription |
| Text (.txt) | Image (.png) | LibreOffice |

#### Converting Audio to Text

With Google Cloud Speech-to-Text integration, MinAPI can transcribe audio files:

```javascript
// Example: Convert an audio file to text
const result = await API.Files.convertFile({
  inType: '.mp3', 
  outType: '.txt',
  inPath: '/path/to/audio.mp3',
  outPath: '/output/directory'
});
```

#### Converting Text to Images

Convert plain text files to PNG images:

```javascript
// Example: Convert a text file to an image
const result = await API.Files.convertFile({
  inType: '.txt', 
  outType: '.png',
  inPath: '/path/to/text.txt',
  outPath: '/output/directory'
});
```

## API Reference

[Documentation to be added]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Haseeb Qureshi (HQ)](https://github.com/avenuedigital/MinAPI)

## Support

For issues and feature requests, please use the [GitHub issues page](https://github.com/avenuedigital/MinAPI/issues).
