# GET /files/:id/download

## download Files

### Endpoint

```
GET /files/:id/download
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
Binary file data with appropriate Content-Type header
```

### Example

```javascript
// Download a file
const response = await fetch('/files/FILE_ID/download', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

// Option 1: Get as blob
const blob = await response.blob();
const url = URL.createObjectURL(blob);
window.open(url);

// Option 2: Force download
const downloadResponse = await fetch('/files/FILE_ID/download?force=true', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
```

---

*Generated on 2025-05-28T14:54:24.677Z*
