# Document Processing

BasefloorAPI provides powerful document processing capabilities that allow you to convert and manipulate documents between different formats.

## Overview

The document processing system is built on top of the file management system and provides additional functionality for working with document files like PDFs, Word documents, and more.

## File Conversion

Convert documents between different formats using the conversion endpoint:

```javascript
// Convert a document to PDF
POST /files/:id/convert
{
  "format": "pdf",
  "options": {
    "quality": "high"
  }
}
```

## Supported Formats

BasefloorAPI supports conversion between various document formats:

- **PDF** - Portable Document Format
- **DOCX** - Microsoft Word Document
- **TXT** - Plain Text
- **HTML** - HyperText Markup Language
- **RTF** - Rich Text Format

## Configuration

Configure document processing in your `basefloor.config.js`:

```javascript
module.exports = (API) => ({
  files: {
    provider: 'local',
    conversion: {
      enabled: true,
      formats: ['pdf', 'docx', 'txt', 'html'],
      quality: 'high'
    }
  }
})
```

## API Endpoints

### Convert Document

Convert a file to a different format:

```http
POST /files/:id/convert
Content-Type: application/json

{
  "format": "pdf",
  "options": {
    "quality": "high",
    "orientation": "portrait"
  }
}
```

### Check Conversion Status

Check the status of a conversion job:

```http
GET /files/:id/conversion-status
```

Response:
```json
{
  "status": "completed",
  "originalFormat": "docx",
  "targetFormat": "pdf",
  "progress": 100,
  "downloadUrl": "/files/:converted_id/download"
}
```

## Examples

### Basic Document Conversion

```javascript
// Upload and convert a document
const formData = new FormData()
formData.append('file', documentFile)

// Upload the document
const uploadResponse = await fetch('/files', {
  method: 'POST',
  body: formData
})

const { file } = await uploadResponse.json()

// Convert to PDF
const conversionResponse = await fetch(`/files/${file._id}/convert`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    format: 'pdf',
    options: {
      quality: 'high'
    }
  })
})

const { conversionId } = await conversionResponse.json()
```

### Batch Document Processing

```javascript
// Process multiple documents
const documents = ['doc1.docx', 'doc2.txt', 'doc3.html']

const conversions = await Promise.all(
  documents.map(async (doc) => {
    const uploadResponse = await fetch('/files', {
      method: 'POST',
      body: createFormData(doc)
    })
    
    const { file } = await uploadResponse.json()
    
    return fetch(`/files/${file._id}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'pdf' })
    })
  })
)
```

## Error Handling

Document conversion may fail for various reasons. Always handle errors appropriately:

```javascript
try {
  const response = await fetch(`/files/${fileId}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format: 'pdf' })
  })
  
  if (!response.ok) {
    const error = await response.json()
    console.error('Conversion failed:', error.message)
    return
  }
  
  const result = await response.json()
  console.log('Conversion started:', result.conversionId)
} catch (error) {
  console.error('Network error:', error)
}
```

## Best Practices

1. **Check file size** - Large documents may take longer to convert
2. **Monitor conversion status** - Use the status endpoint for long-running conversions
3. **Handle errors gracefully** - Not all formats can be converted to all other formats
4. **Clean up temporary files** - Remove converted files when no longer needed
5. **Use appropriate quality settings** - Balance file size and quality based on your needs

## Related

- [File Management](/reference/files) - Core file handling functionality
- [API Routes](/api/routes/) - Complete API reference
- [Configuration](/guide/configuration) - Configuration options 