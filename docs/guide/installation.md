# Installation

This guide covers the installation and setup of MinAPI and its dependencies.

## System Requirements

- **Node.js**: Version 14.0 or higher
- **MongoDB**: Version 4.0 or higher
- **Operating System**: macOS, Linux, or Windows

## Dependencies

MinAPI requires certain system dependencies for its advanced features:

### LibreOffice (Required for document processing)

MinAPI uses LibreOffice for document conversion and processing features.

**macOS:**
```bash
brew install libreoffice
```

**Ubuntu/Debian:**
```bash
sudo apt install libreoffice
```

**CentOS/RHEL:**
```bash
sudo yum install libreoffice
```

### Ghostscript (Required for PDF processing)

**macOS:**
```bash
brew install ghostscript
```

**Ubuntu/Debian:**
```bash
sudo apt-get install ghostscript
```

**CentOS/RHEL:**
```bash
sudo yum install ghostscript
```

## Installing MinAPI

### Using npm

```bash
npm install @hq/minapi
```

### Using yarn

```bash
yarn add @hq/minapi
```

### Using pnpm

```bash
pnpm add @hq/minapi
```

## Optional Dependencies

### Google Cloud SDK (For audio transcription)

If you plan to use audio transcription features:

1. **Install Google Cloud SDK:**

   **macOS:**
   ```bash
   brew install google-cloud-sdk
   ```

   **Linux:**
   ```bash
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   ```

2. **Set up authentication:**
   - Create a Google Cloud project
   - Enable the Speech-to-Text API
   - Create a service account with Speech-to-Text API access
   - Download the service account key file (JSON)

3. **Configure credentials:**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/credentials.json"
   ```

### AWS CLI (For S3 file storage)

If you plan to use AWS S3 for file storage:

```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

Configure AWS credentials:
```bash
aws configure
```

## Database Setup

### MongoDB Installation

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### MongoDB Atlas (Cloud)

Alternatively, you can use MongoDB Atlas for a cloud-hosted database:

1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Use it in your MinAPI configuration

## Verification

After installation, verify everything is working:

1. **Check Node.js version:**
   ```bash
   node --version
   ```

2. **Check MongoDB connection:**
   ```bash
   mongosh # or mongo for older versions
   ```

3. **Test LibreOffice:**
   ```bash
   libreoffice --version
   ```

4. **Test Ghostscript:**
   ```bash
   gs --version
   ```

## Troubleshooting

### Common Issues

**Permission denied errors:**
- On macOS/Linux, you might need to use `sudo` for system-wide installations
- Consider using a Node version manager like `nvm` to avoid permission issues

**MongoDB connection issues:**
- Ensure MongoDB is running: `brew services start mongodb-community` (macOS) or `sudo systemctl start mongod` (Linux)
- Check your connection string and credentials
- Verify network connectivity and firewall settings

**LibreOffice not found:**
- Ensure LibreOffice is in your system PATH
- Try restarting your terminal after installation

**Missing dependencies:**
- Run `npm install` again to ensure all dependencies are installed
- Check for any error messages during installation

## Next Steps

Once installation is complete:

- [Quick Start Guide](./quick-start) - Get your first API running
- [Configuration Reference](./configuration) - Learn about all configuration options
- [Examples](../examples/) - See real-world usage examples 