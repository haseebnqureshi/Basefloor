---
layout: default
title: Files Reference
---

# MinAPI Files Reference

MinAPI provides a robust file management system that supports file uploads, storage, processing, and conversions.

## Configuration

To enable the file management system, add the following to your `minapi.config.js`:

```javascript
files: {
  enabled: true,
  provider: '@digitalocean/files',  // Choose your storage provider
},
providers: {
  '@digitalocean/files': {
    access: process.env.DIGITALOCEAN_SPACES_ACCESS,
    secret: process.env.DIGITALOCEAN_SPACES_SECRET,
    endpoint: process.env.DIGITALOCEAN_SPACES_ENDPOINT,
    region: process.env.DIGITALOCEAN_SPACES_REGION,
    bucket: process.env.DIGITALOCEAN_SPACES_BUCKET,
    cdn: process.env.DIGITALOCEAN_SPACES_CDN,
  },
  // Or other providers
}
```

### Supported Storage Providers

- `@digitalocean/files` - DigitalOcean Spaces
- `@aws/files` - AWS S3
- `@local/files` - Local filesystem

## API Endpoints

When the file system is enabled, MinAPI automatically adds the following endpoints:

### Upload File

```http
POST /files
```

**Headers:**
- `Authorization`: Bearer token for authentication
- `Content-Type`: multipart/form-data
- `x-minapi-name`: Original filename with extension (e.g., "document.pdf")
- `x-minapi-size`: File size in bytes
- `x-minapi-type`: MIME type of the file
- `x-minapi-modified`: File's last modified timestamp in ISO format

**Response:**
```json
{
  "_id": "file_id",
  "hash": "md5_hash_of_file_metadata",
  "filename": "hash_based_filename.ext",
  "extension": ".ext",
  "user_id": "user_id",
  "name": "filename.ext",
  "size": 1234,
  "content_type": "application/pdf",
  "file_modified_at": "2024-02-15T12:00:00Z",
  "key": "storage_key",
  "url": "https://cdn.example.com/filename.ext",
  "provider": "storage_provider_name",
  "bucket": "storage_bucket_name",
  "uploaded_at": "2024-02-15T12:00:00Z"
}
```

### Get File Information

```http
GET /files/:_id?
```

Returns information about a specific file or all files if no ID is provided.

### Download File

```http
GET /files/:_id/download
```

Downloads a file with proper Content-Type headers.

### Update File Metadata

```http
PUT /files/:_id?
```

Updates file metadata like name or other properties.

### Delete File

```http
DELETE /files/:_id?
```

Deletes a file from storage.

### Convert File

```http
POST /files/:_id/convert/:to?
```

Converts a file to a different format.

## Programmatic Usage

MinAPI exposes a `Files` object with methods for working with files:

### Upload a File

```javascript
const fileResult = await API.Files.upload({
  buffer: fileBuffer,  // Buffer containing file data
  name: "example.pdf",  // Original filename
  size: fileBuffer.length,  // File size in bytes
  type: "application/pdf",  // MIME type
  modified: new Date(),  // Modification date
  user_id: req.user._id  // User who owns the file
});
```

### Get a File

```javascript
const file = await API.Files.get({ _id: 'file_id' });
```

### Download a File

```javascript
// Get a readable stream of the file content
const fileStream = await API.Files.download({ _id: 'file_id' });
```

### Update a File

```javascript
const updatedFile = await API.Files.update(
  { _id: 'file_id' },  // Where condition
  { name: 'new-name.pdf' }  // New values
);
```

### Delete a File

```javascript
const result = await API.Files.delete({ _id: 'file_id' });
```

## File Conversion

MinAPI includes a powerful file conversion system that supports various formats.

### Supported Conversions

| From | To | Required System Dependency |
|------|-----|---------|
| Documents (.doc, .docx, etc.) | PDF | LibreOffice |
| PDF | PNG images | Ghostscript |
| Images | Optimized PNG | Sharp |
| Audio files (.mp3, .wav, etc.) | Text (.txt) | Google Cloud Speech-to-Text |
| Text (.txt) | Image (.png) | LibreOffice |

### Convert a File

```javascript
// Convert a file using fileId
const convertedFiles = await API.Files.convert({
  _id: 'file_id',
  to: '.png'  // Target format
});

// Or convert using file path
const result = await API.Files.convertFile({
  inPath: '/path/to/document.docx',
  outPath: '/output/directory',
  inType: '.docx',
  outType: '.pdf'
});
```

## File Storage Model

Files are stored in the database with the following model:

```javascript
Files: {
  collection: 'file',
  labels: ['File', 'Files'],
  values: {
    _id: ['ObjectId', 'rd'],
    hash: ['String', 'r'],
    filename: ['String', 'r'],
    extension: ['String', 'r'],
    user_id: ['ObjectId', 'cr'],
    name: ['String', 'cru'],
    size: ['Number', 'r'],
    content_type: ['String', 'r'],
    file_modified_at: ['Date', 'r'],
    key: ['String', 'r'],
    url: ['String', 'r'],
    provider: ['String', 'r'],
    bucket: ['String', 'r'],
    uploaded_at: ['Date', 'r'],
    parent_file: ['ObjectId', 'r']
  }
}
```

The `parent_file` field allows for creating relationships between files, such as tracking converted versions.

## Child Files

A file can have child files (for example, when converting a PDF to multiple PNG images):

```javascript
// Get all child files of a file
const childFiles = await API.Files.getFiles({ parent_file: 'file_id' });
```

## Examples

### Upload and Convert a Document

```javascript
// Route handler example
app.post('/upload-and-convert', async (req, res) => {
  try {
    // 1. Upload the file
    const file = await API.Files.upload({
      buffer: req.file.buffer,
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      modified: new Date(),
      user_id: req.user._id
    });

    // 2. Convert to PDF
    let pdfFile = file;
    if (file.extension !== '.pdf') {
      const convertedFiles = await API.Files.convert({
        _id: file._id,
        to: '.pdf'
      });
      pdfFile = convertedFiles[0];
    }

    // 3. Convert PDF to PNG images
    const pngFiles = await API.Files.convert({
      _id: pdfFile._id,
      to: '.png'
    });

    res.json({
      original: file,
      pdf: pdfFile,
      images: pngFiles
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Check If Conversion is Supported

```javascript
app.get('/convert-support/:from/:to', async (req, res) => {
  const { from, to } = req.params;
  const isSupported = await API.Files.isSupported(from, to);
  
  res.json({
    from: `.${from}`,
    to: `.${to}`,
    supported: isSupported
  });
});
```

## Best Practices

1. **Security**: Always verify user permissions before allowing file operations
2. **Cleanup**: Implement regular cleanup of temporary files
3. **Validation**: Validate file types and sizes before processing
4. **Error Handling**: Properly handle and log file operation errors
5. **Child Files**: Track relationships between original and converted files 