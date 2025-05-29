# Installation

This guide covers the installation and setup of BasefloorAPI and its dependencies.

## System Requirements

- **Node.js**: Version 16.0 or higher
- **MongoDB**: Version 4.4 or higher (local or remote)
- **Operating System**: Windows, macOS, or Linux

BasefloorAPI requires certain system dependencies for its advanced features:

### LibreOffice (Optional)

BasefloorAPI uses LibreOffice for document conversion and processing features.

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install libreoffice
```

**macOS:**
```bash
brew install --cask libreoffice
```

**Windows:**
Download and install from [LibreOffice official website](https://www.libreoffice.org/download/download/)

### ImageMagick (Optional)

For advanced image processing capabilities:

**Ubuntu/Debian:**
```bash
sudo apt-get install imagemagick
```

**macOS:**
```bash
brew install imagemagick
```

**Windows:**
Download and install from [ImageMagick website](https://imagemagick.org/script/download.php#windows)

## Installing BasefloorAPI

### Using npm

```bash
npm install @basefloor/api
```

### Using yarn

```bash
yarn add @basefloor/api
```

### Using pnpm

```bash
pnpm add @basefloor/api
```

## 🚀 Smart Provider Installation

BasefloorAPI uses a **dynamic dependency system** that only installs the packages you actually need based on your configuration. This keeps your project lightweight and secure.

### How It Works

1. **Base Installation**: When you install `@basefloor/api`, you get a lightweight core package
2. **Configuration**: You specify which providers you want to use in your `basefloor.config.js`
3. **Smart Dependencies**: BasefloorAPI automatically installs only the packages for providers you've configured
4. **No Bloat**: You never install unused dependencies

### Example

```javascript
// basefloor.config.js
module.exports = (API) => ({
  email: {
    provider: 'sendgrid'  // Only installs sendgrid package
  },
  ai: {
    providers: {
      openai: { apiKey: '...' }  // Only installs openai package
    }
  }
  // Does NOT install: mailgun, postmark, anthropic, etc.
})
```

```bash
npm install @basefloor/api
# ✅ Installs core framework
# ✅ Reads your config
# ✅ Installs ONLY: sendgrid + openai
# ❌ SKIPS: All other provider packages
```

### Benefits

- **🪶 Lightweight**: Smaller `node_modules` folder
- **🔒 Secure**: Fewer dependencies = smaller attack surface  
- **⚡ Faster**: Quicker installs and builds
- **💰 Cost-effective**: Only pay for services you use

## Available Providers

### Email Providers
- `sendgrid` - SendGrid email service
- `mailgun` - Mailgun email service  
- `postmark` - Postmark email service
- `nodemailer` - SMTP email (any provider)

### AI Providers  
- `openai` - OpenAI GPT models
- `anthropic` - Anthropic Claude models
- `google` - Google Gemini models

### File Storage Providers
- `aws-s3` - Amazon S3 storage
- `cloudinary` - Cloudinary media management
- `local` - Local file system (no external packages)

### Database Providers
- `mongodb` - MongoDB (always included)
- `mongoose` - Mongoose ODM (always included)

## Setting Up MongoDB

### Option 1: Local MongoDB Installation

**Ubuntu/Debian:**
```bash
# Import the public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create a list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Reload local package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

**Windows:**
Download and install from [MongoDB official website](https://www.mongodb.com/try/download/community)

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Use it in your BasefloorAPI configuration

## Environment Variables

Create a `.env` file in your project root:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/your-app-name
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your-app-name

# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-very-secure-secret-key-here
JWT_EXPIRES_IN=7d

# File Storage (Optional)
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Email Provider (Optional)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key

# AI Services (Optional)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Google Cloud (Optional)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_KEY_FILE=path/to/service-account.json
```

## Verification

To verify your installation:

1. Create a simple test file:

```javascript
// test.js
const BasefloorAPI = require('@basefloor/api')

console.log('BasefloorAPI version:', require('@basefloor/api/package.json').version)
```

2. Run it:

```bash
node test.js
```

3. If successful, you should see the version number printed.

4. Use it in your BasefloorAPI configuration

## Common Issues

### MongoDB Connection Issues

**Issue**: Cannot connect to MongoDB
**Solution**: 
- Ensure MongoDB is running
- Check your connection string
- Verify network connectivity (for Atlas)

### Permission Issues

**Issue**: Permission denied when starting the server
**Solution**:
- Check port availability
- Use a different port (e.g., 3001, 8080)
- Run with appropriate permissions

### Missing Dependencies

**Issue**: Optional features not working
**Solution**:
- Install LibreOffice for document processing
- Install ImageMagick for image processing
- Check system PATH variables

## Next Steps

- [Quick Start Guide](./quick-start) - Get your first API running
- [Configuration Reference](./configuration) - Learn about all configuration options
- [Examples](../examples/) - See practical implementations 