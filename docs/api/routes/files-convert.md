# POST /files/:id/convert

## convert Files

### Endpoint

```
POST /files/:id/convert
```

### Authentication

🔒 Required

### Permissions

```json
"auth"
```

### Request

No request body required - conversion is triggered by the file ID in the URL

### Response

```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "filename": "converted123.png",
    "name": "profile-photo (1 of 1)",
    "size": 2048000,
    "content_type": "image/png",
    "parent_file": "507f1f77bcf86cd799439011",
    // ... other file fields
  }
]
```

### Example

```javascript
// Convert a file (e.g., PDF to PNG)
const response = await fetch('/files/FILE_ID/convert', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
});

const convertedFiles = await response.json();
console.log('Converted files:', convertedFiles);
```

---

*Generated on 2025-05-28T14:54:24.678Z*
