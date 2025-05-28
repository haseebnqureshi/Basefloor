# GET /files

## readAll Files

### Endpoint

```
GET /files
```

### Authentication

🔒 Required

### Permissions

```json
"auth"
```

### Request

No request body required

### Response

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "filename": "abc123def456.jpg",
    "name": "profile-photo.jpg",
    "size": 1024000,
    "content_type": "image/jpeg",
    // ... other file fields
  }
]
```

### Example

```javascript
// Using fetch
const response = await fetch('/files', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const data = await response.json();
```

---

*Generated on 2025-05-28T14:54:24.677Z*
