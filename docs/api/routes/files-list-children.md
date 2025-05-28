# GET /files/:id/files

## list-children Files

### Endpoint

```
GET /files/:id/files
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
    "_id": "507f1f77bcf86cd799439012",
    "parent_file": "507f1f77bcf86cd799439011",
    "name": "profile-photo (1 of 3)",
    // ... other file fields
  }
]
```

### Example

```javascript
// Get all child files (e.g., converted versions)
const response = await fetch('/files/PARENT_FILE_ID/files', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const childFiles = await response.json();
console.log('Child files:', childFiles);
```

---

*Generated on 2025-05-28T14:54:24.677Z*
