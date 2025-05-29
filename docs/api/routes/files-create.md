# POST /files

## create Files

### Endpoint

```
POST /files
```

### Authentication

🔒 Required

### Permissions

```json
"auth"
```

### Request

**Headers:**
```
x-basefloor-name: filename.jpg
x-basefloor-size: 1024000
x-basefloor-type: image/jpeg
x-basefloor-modified: 2024-01-01T00:00:00.000Z
x-basefloor-prefix: user-uploads  // optional
```

**Body:** Binary file data (multipart/form-data)

### Response

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "filename": "abc123def456.jpg",
  "name": "profile-photo.jpg",
  "size": 1024000,
  "content_type": "image/jpeg",
  "hash": "abc123def456",
  "key": "user-uploads/abc123def456.jpg",
  "url": "https://cdn.example.com/user-uploads/abc123def456.jpg",
  "uploaded_at": "2024-01-01T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### Example

```javascript
// Upload a file using FormData
const formData = new FormData();
const file = document.querySelector('input[type="file"]').files[0];

const response = await fetch('/files', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'x-basefloor-name': file.name,
    'x-basefloor-size': file.size.toString(),
    'x-basefloor-type': file.type,
    'x-basefloor-modified': new Date(file.lastModified).toISOString(),
    'x-basefloor-prefix': 'user-uploads' // optional
  },
  body: file
});

const uploadedFile = await response.json();
```

---

*Generated on 2025-05-28T14:54:24.677Z*
