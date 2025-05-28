# GET /users/posts(Posts)

## readAll Users

### Endpoint

```
GET /users/posts(Posts)
```

### Authentication

🔒 Required

### Permissions

```json
"true"
```

### Filters

```
@user._id=@post.author_id
```

### Request

No request body required

### Response

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    // ... model fields
  }
]
```

### Example

```javascript
// Using fetch
const response = await fetch('/users/posts(Posts)', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const data = await response.json();
```

---

*Generated on 2025-05-28T14:54:24.678Z*
