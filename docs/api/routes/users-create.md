# POST /users

## create Users

### Endpoint

```
POST /users
```

### Authentication

🔒 Required

### Permissions

```json
"true"
```

### Request

```json
{
  "email": "example string",
  "password": "example string"
}
```

### Response

```json
{
  "insertedId": "507f1f77bcf86cd799439011"
}
```

### Example

```javascript
// Using fetch
const response = await fetch('/users', {
  method: 'POST',
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

*Generated on 2025-05-28T14:54:24.678Z*
