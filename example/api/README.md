# Basefloor API Examples

This directory contains working examples for all 9 core features of Basefloor, each demonstrating a specific capability in a minimal, functional way. Each example is fully documented with JSDoc-style comments, request/response examples, and production implementation guidance.

## 🚀 Features Covered

### 1. **Quick Setup** (`01-quick-setup.js`)
- Minimal API setup with just a few lines of code
- Basic hello world and health check endpoints
- Demonstrates the simplicity of getting started

### 2. **Built-in Authentication** (`02-authentication.js`)
- JWT-based authentication system
- User registration and login endpoints
- Protected routes with role-based permissions
- Password hashing and token generation

### 3. **MongoDB Integration** (`03-mongodb-integration.js`)
- Complete CRUD operations for tasks
- Database connection management
- Query filtering and sorting
- Database statistics and health checks

### 4. **File Management** (`04-file-management.js`)
- File upload with size and type restrictions
- File download and streaming
- Image processing and conversion
- File metadata storage and management

### 5. **AI Integration** (`05-ai-integration.js`)
- Multi-provider AI support (OpenAI, Anthropic, Google)
- Chat completions and text generation
- Content analysis (sentiment, summarization, keywords)
- Conversation history and token tracking

### 6. **Email Services** (`06-email-services.js`)
- Simple email sending
- Template-based emails with variable substitution
- Bulk email sending (admin only)
- Email logging and delivery tracking

### 7. **Audio Transcription** (`07-audio-transcription.js`)
- Speech-to-text capabilities with confidence scores
- Word-level timestamps and detailed transcription results  
- Search functionality across transcriptions
- Mock implementation that works out-of-the-box

### 8. **Document Processing** (`08-document-processing.js`)
- Document format conversion (PDF, Word, Excel, PowerPoint)
- Text extraction from documents
- Document merging capabilities
- Mock implementation that works out-of-the-box

### 9. **Express-based** (`09-express-based.js`)
- Advanced Express.js features and middleware
- Rate limiting and request validation
- Streaming responses and Server-Sent Events
- Performance monitoring and system metrics

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local or cloud instance)
3. **API Keys** for the services you want to use:
   - OpenAI API key (for AI features)
   - SendGrid/Mailgun/Postmark (for email)
   - AWS/Minio/DigitalOcean (for advanced file storage)

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
cd example/api
npm install
```

### 2. Environment Configuration
Copy the comprehensive environment file:
```bash
cp .env-comprehensive .env
```

Edit `.env` and add your API keys and configuration:
```env
# Required for all examples
MONGODB_URI=mongodb://localhost:27017/basefloor-comprehensive
JWT_SECRET=your-secret-key-here

# For AI examples
OPENAI_API_KEY=your-openai-key-here

# For email examples  
SENDGRID_API_KEY=your-sendgrid-key-here
EMAIL_FROM=noreply@yourdomain.com
```

### 3. Database Setup
Make sure MongoDB is running. The examples will automatically create collections and indexes.

## 🏃‍♂️ Running Examples

Each example is a standalone API server. Run them individually:

```bash
# Quick Setup Example
node 01-quick-setup.js

# Authentication Example
node 02-authentication.js

# MongoDB Integration Example
node 03-mongodb-integration.js

# File Management Example
node 04-file-management.js

# AI Integration Example
node 05-ai-integration.js

# Email Services Example
node 06-email-services.js

# Audio Transcription Example
node 07-audio-transcription.js

# Document Processing Example
node 08-document-processing.js

# Express-based Example
node 09-express-based.js
```

## 📡 API Endpoints

### Quick Setup (`01-quick-setup.js`)
```
GET /hello          # Basic hello world
GET /health         # Health check
```

### Authentication (`02-authentication.js`)
```
POST /auth/register # Register new user
POST /auth/login    # Login user
GET  /auth/profile  # Get user profile (protected)
GET  /auth/admin    # Admin-only route
```

### MongoDB Integration (`03-mongodb-integration.js`)
```
POST   /tasks       # Create task
GET    /tasks       # Get all user tasks
GET    /tasks/:id   # Get specific task
PUT    /tasks/:id   # Update task
DELETE /tasks/:id   # Delete task
GET    /stats       # Database statistics (admin)
```

### File Management (`04-file-management.js`)
```
POST   /files/upload           # Upload file
GET    /files                  # Get user files
GET    /files/:id              # Get file info
GET    /files/:id/download     # Download file
POST   /files/:id/process      # Process image
DELETE /files/:id              # Delete file
```

### AI Integration (`05-ai-integration.js`)
```
POST /ai/chat          # Chat with AI
POST /ai/generate      # Generate text
POST /ai/analyze       # Analyze text
POST /ai/content       # Generate content
GET  /ai/conversations # Get chat history
GET  /ai/providers     # Get available providers
```

### Email Services (`06-email-services.js`)
```
POST /emails/send          # Send simple email
POST /emails/send-template # Send templated email
POST /emails/send-bulk     # Send bulk emails (admin)
GET  /emails/logs          # Get email logs
GET  /emails/templates     # Get available templates
GET  /emails/test          # Test email config (admin)
```

### Audio Transcription (`07-audio-transcription.js`)
```
POST   /transcription/upload        # Upload audio file
POST   /transcription/:id/transcribe # Start transcription
GET    /transcription/:id           # Get transcription result
GET    /transcriptions              # Get all transcriptions
POST   /transcriptions/search       # Search transcriptions
GET    /transcription/:id/details   # Get detailed results
DELETE /transcription/:id           # Delete transcription
```

### Document Processing (`08-document-processing.js`)
```
POST /documents/upload         # Upload document
POST /documents/:id/convert    # Convert document format
POST /documents/:id/extract-text # Extract text content
GET  /documents                # Get all documents
GET  /documents/:id            # Get document details
POST /documents/merge          # Merge multiple documents
GET  /documents/formats        # Get supported formats
```

### Express-based (`09-express-based.js`)
```
GET  /api/v1/health            # Health check with metrics
GET  /api/v1/stream            # Streaming response demo
POST /api/v1/upload-progress   # Upload with progress
GET  /api/v1/events            # Server-sent events
GET  /api/v1/high-frequency/test # Rate limited endpoint
GET  /api/v1/data/:id          # Route parameters and queries
GET  /api/v1/metrics           # Performance metrics
```

## 🧪 Testing Examples

### 1. Authentication Flow
```bash
# Register a user
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Use the returned token for protected routes
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/auth/profile
```

### 2. CRUD Operations
```bash
# Create a task (requires auth token)
curl -X POST http://localhost:4000/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Basefloor","description":"Go through all examples"}'

# Get all tasks
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/tasks
```

### 3. AI Integration
```bash
# Chat with AI (requires OPENAI_API_KEY)
curl -X POST http://localhost:4000/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, how are you?"}'
```

### 4. File Upload
```bash
# Upload a file
curl -X POST http://localhost:4000/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/file.jpg"
```

### 5. Email Sending
```bash
# Send an email (requires email provider API key)
curl -X POST http://localhost:4000/emails/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to":"recipient@example.com","subject":"Test","text":"Hello from Basefloor!"}'
```

### 6. Audio Transcription
```bash
# Upload audio file for transcription
curl -X POST http://localhost:4000/transcription/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/audio.mp3"

# Start transcription (mock implementation)
curl -X POST http://localhost:4000/transcription/:id/transcribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language":"en-US"}'
```

### 7. Document Processing  
```bash
# Upload document for processing
curl -X POST http://localhost:4000/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf"

# Convert document format (mock implementation)
curl -X POST http://localhost:4000/documents/:id/convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"format":"docx"}'
```

### 8. Express Features
```bash
# Health check with system metrics
curl http://localhost:4000/api/v1/health

# Streaming response
curl http://localhost:4000/api/v1/stream

# Server-sent events
curl http://localhost:4000/api/v1/events
```

## 🔧 Configuration Options

### Using Different Providers

**Email Providers:**
- SendGrid: Set `SENDGRID_API_KEY`
- Mailgun: Set `MAILGUN_API_KEY` and `MAILGUN_DOMAIN`
- Postmark: Set `POSTMARK_API_KEY`

**AI Providers:**
- OpenAI: Set `OPENAI_API_KEY`
- Anthropic: Set `ANTHROPIC_API_KEY`
- Google AI: Set `GOOGLE_AI_API_KEY`

**File Storage:**
- Local: Default (files stored in `./uploads`)
- AWS S3: Set AWS credentials
- Minio: Set Minio configuration
- DigitalOcean Spaces: Set DO credentials

## 📚 Next Steps

1. **Combine Features**: Use `basefloor-comprehensive.config.js` to run multiple features together
2. **Custom Models**: Add your own data models to the configuration
3. **Advanced Routes**: Create custom business logic routes
4. **Deployment**: Deploy to your preferred hosting platform
5. **Frontend Integration**: Connect with the included app examples

## 🐛 Troubleshooting

**Common Issues:**

1. **MongoDB Connection Error**: Ensure MongoDB is running and URI is correct
2. **Authentication Errors**: Check JWT_SECRET is set and tokens are valid
3. **API Key Errors**: Verify all required API keys are configured
4. **File Upload Issues**: Check file permissions and upload directory exists
5. **Email Not Sending**: Verify email provider credentials and FROM address

**Debug Mode:**
Set `NODE_ENV=development` for detailed error messages.

## 📖 Documentation

For more detailed information, see:
- Main documentation: `/docs`
- API reference: `/docs/api`
- Configuration guide: `/docs/reference/guide/configuration.md`

## 🎯 Mock vs Production Implementation

**Examples 7 & 8** (Audio Transcription and Document Processing) use mock implementations to work out-of-the-box:

### For Production Use:
- **Audio Transcription**: Replace mock functions with real Google Cloud Speech API calls
- **Document Processing**: Replace mock functions with LibreOffice, PDF processors, or cloud conversion APIs
- **Set up proper API keys** in your `.env` file for external services

### Mock Benefits:
- ✅ Work immediately without setup
- ✅ Demonstrate full API structure  
- ✅ Show expected request/response formats
- ✅ Perfect for testing and development

## 🚀 Quick Start Summary

1. **Choose an example** based on the feature you want to explore
2. **Run the example**: `node [example-name].js`  
3. **Test the endpoints** using the provided curl commands
4. **Customize and extend** for your specific use case

Each example is designed to be minimal yet functional, demonstrating the core capabilities of Basefloor. Use them as starting points for your own applications!

---

## 📝 Documentation Standards

Each example includes comprehensive documentation:

### ✨ Enhanced Documentation Features:
- **JSDoc-style comments** for all routes and functions
- **Request/response examples** with realistic data
- **Parameter documentation** with types and descriptions
- **Authentication requirements** clearly marked
- **Production implementation guidance** for mock features
- **curl command examples** for easy testing
- **Error handling documentation** with status codes

### 🎯 Documentation Structure:
```javascript
/**
 * Route description and purpose
 * 
 * @route METHOD /path
 * @auth Required/Optional - Authentication details
 * @param {Type} name - Parameter description
 * @returns {Object} 200 - Success response format
 * @returns {Object} 404 - Error response format
 * 
 * @example
 * // Request example
 * // Response example  
 */
```

---

**🎉 All 9 Examples Working & Ready to Use!** 