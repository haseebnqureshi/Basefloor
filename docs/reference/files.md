# File Management

MinAPI provides comprehensive file management capabilities including upload, storage, processing, and serving of files.

## Configuration

Configure file storage in your `minapi.config.js`:

### Local Storage

```javascript
{
  files: {
    storage: {
      provider: 'local',
      local: {
        uploadDir: './uploads',
        publicPath: '/files'
      }
    }
  }
}
```

### AWS S3 Storage

```javascript
{
  files: {
    storage: {
      provider: 's3',
      s3: {
        bucket: process.env.AWS_BUCKET,
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    }
  }
}
```

## File Upload

Upload files through the built-in file upload endpoints:

```bash
# Upload a file
curl -X POST http://localhost:3000/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  -F "description=My document"
```

## File Processing

MinAPI supports various file processing capabilities:

- Image resizing and optimization
- Document format conversion (using LibreOffice)
- PDF processing (using Ghostscript)
- Audio transcription
- File metadata extraction

## File Model

The built-in Files model includes:

```javascript
{
  _id: ['ObjectId', 'rud'],
  filename: ['String', 'cru'],
  originalname: ['String', 'cru'],
  mimetype: ['String', 'cru'],
  size: ['Number', 'cru'],
  path: ['String', 'cru'],
  url: ['String', 'r'],
  user_id: ['ObjectId', 'cru'],
  created_at: ['Date', 'r'],
  updated_at: ['Date', 'r']
}
```

## Examples

### Upload with Metadata

```javascript
// Custom file upload with additional metadata
app.post('/upload', async (req, res) => {
  const file = await API.Files.create({
    ...req.file,
    category: req.body.category,
    tags: req.body.tags,
    user_id: req.user._id
  });
  
  res.json(file);
});
```

### Image Processing

```javascript
// Resize an image
const processedImage = await API.Files.process(fileId, {
  type: 'resize',
  width: 800,
  height: 600,
  format: 'jpeg'
});
``` 