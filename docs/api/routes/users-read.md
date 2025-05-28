# GET /users/:id

## read Users

### Endpoint

```
GET /users/:id
```

### Authentication

🔒 Required

### Permissions

```json
"true"
```

### Request

No request body required

### Response

```json
{
  "_id": "507f1f77bcf86cd799439011",
  // ... model fields
}
```

### Example

```javascript
// Using fetch
const response = await fetch('/users/:id', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const data = await response.json();
```

---

*Generated on 2025-05-28T13:50:53.522Z*
