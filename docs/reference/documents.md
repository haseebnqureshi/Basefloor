# Document Processing

BasefloorAPI provides powerful document processing capabilities that allow you to convert and manipulate documents between different formats.

## Overview

The document processing system is built on top of the file management system and provides automatic conversion functionality for working with document files like PDFs, Word documents, images, and audio files.

## File Conversion

Convert documents automatically using the conversion endpoint. The system will apply all available converters in sequence:

```javascript
// Convert a document (no request body needed)
POST /files/:_id/convert
```

## Check Conversion Compatibility

Check if a file extension can be converted:

```javascript
// Check if .docx files can be converted
GET /convert/docx
```

Response:
```json
{
  "extension": ".docx",
  "accepted": true,
  "to": ".pdf"
}
```

## Supported Conversions

BasefloorAPI supports the following automatic conversions:

- **Office Documents → PDF** - Word, Excel, PowerPoint files to PDF using LibreOffice
- **Audio Files → Text** - MP3, WAV files to text transcription
- **Text → PNG** - Plain text files to image format
- **PDF → PNG** - PDF pages to individual PNG images
- **Images → PNG** - Image optimization and format conversion

## API Endpoints

### Convert Document

Convert a file using all available converters:

```http
POST /files/:_id/convert
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "_id": "converted_file_id_1",
    "name": "Document (1 of 3)",
    "extension": ".png",
    "content_type": "image/png",
    "size": 245760,
    "url": "https://cdn.example.com/hash123.png",
    "parent_file": "original_file_id"
  }
]
```

### Check Conversion Compatibility

Check if a file extension can be converted:

```http
GET /convert/:extension
Authorization: Bearer <token>
```

Example:
```http
GET /convert/pdf
```

Response:
```json
{
  "extension": ".pdf",
  "accepted": true,
  "to": ".png"
}
```

### Get File Information

Retrieve file details including converted files:

```http
GET /files/:_id
Authorization: Bearer <token>
```

### Get Child Files

Get all files that were converted from a parent file:

```http
GET /files/:_id/files
Authorization: Bearer <token>
```

## Examples

### Basic Document Conversion

```javascript
// Upload a document with custom headers
const formData = new FormData()
formData.append('file', documentFile)

// Upload the document with metadata headers
const uploadResponse = await fetch('/files', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'X-Basefloor-Name': 'my-document.pdf',
    'X-Basefloor-Size': documentFile.size,
    'X-Basefloor-Type': documentFile.type,
    'X-Basefloor-Modified': documentFile.lastModified
  },
  body: formData
})

const file = await uploadResponse.json()

// Convert the document (automatic conversion)
const conversionResponse = await fetch(`/files/${file._id}/convert`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  }
})

const convertedFiles = await conversionResponse.json()
console.log('Converted files:', convertedFiles)
```

### Check Before Converting

```javascript
// Check if a file type can be converted
const checkResponse = await fetch('/convert/pdf', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})

const compatibility = await checkResponse.json()

if (compatibility.accepted) {
  console.log(`PDF files can be converted to ${compatibility.to}`)
  
  // Proceed with conversion
  const conversionResponse = await fetch(`/files/${fileId}/convert`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  
  const convertedFiles = await conversionResponse.json()
}
```

### Get Converted Files

```javascript
// Get all files converted from a parent file
const childFilesResponse = await fetch(`/files/${parentFileId}/files`, {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})

const childFiles = await childFilesResponse.json()
console.log('Child files:', childFiles)
```

## File Upload Headers

When uploading files, use these custom headers for metadata:

- `X-Basefloor-Name` - Original filename
- `X-Basefloor-Size` - File size in bytes  
- `X-Basefloor-Type` - MIME type
- `X-Basefloor-Modified` - Last modified timestamp
- `X-Basefloor-Prefix` - Optional prefix for file storage path

## Error Handling

Document conversion may fail for various reasons. Always handle errors appropriately:

```javascript
try {
  const response = await fetch(`/files/${fileId}/convert`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  
  if (!response.ok) {
    const error = await response.json()
    console.error('Conversion failed:', error.message)
    return
  }
  
  const convertedFiles = await response.json()
  console.log('Conversion completed:', convertedFiles.length, 'files created')
} catch (error) {
  console.error('Network error:', error)
}
```

## Conversion Chain

The system applies converters in sequence. For example, a Word document might go through:

1. **DOCX → PDF** (LibreOffice conversion)
2. **PDF → PNG** (PDF to images conversion)

Each step creates new file records with `parent_file` pointing to the original file.

## Best Practices

1. **Check compatibility first** - Use `/convert/:extension` to verify conversion support
2. **Handle authentication** - All endpoints require valid Bearer token
3. **Monitor file relationships** - Use `parent_file` field to track conversion chains
4. **Handle large files** - Conversions may take time for large documents
5. **Clean up when needed** - Remove converted files that are no longer required

## Related

- [File Management](/reference/files) - Core file handling functionality
- [API Routes](/api/routes/) - Complete API reference
- [Authentication](/reference/authentication) - Authentication setup 