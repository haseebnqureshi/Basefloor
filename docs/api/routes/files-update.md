# PUT /files/:id

## update Files

### Endpoint

```
PUT /files/:id
```

### Authentication

🔒 Required

### Permissions

```json
"auth"
```

### Request

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user_id": "507f1f77bcf86cd799439011",
  "name": "example string",
  "description": "example string",
  "provider": "example string",
  "bucket": "example string",
  "key": "example string",
  "url": "example string",
  "uploaded_at": "2024-01-15T12:00:00Z",
  "file_modified_at": "2024-01-15T12:00:00Z",
  "hash": "example string",
  "size": 123,
  "content_type": "example string",
  "extension": "example string",
  "parent_file": "507f1f77bcf86cd799439011",
  "type": "example string",
  "flattened_at": "2024-01-15T12:00:00Z",
  "flattened_pages": null
}
```

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
// Using fetch
const response = await fetch('/files/:id', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    // Your data here
  })
});

const data = await response.json();
```

---

*Generated on 2025-05-28T14:54:24.677Z*
