# DELETE /users/:id

## delete Users

### Endpoint

```
DELETE /users/:id
```

### Authentication

🔒 Required

### Permissions

```json
"admin=in=@req_user.role"
```

### Request

No request body required

### Response

```json
{
  "deletedCount": 1
}
```

### Example

```javascript
// Using fetch
const response = await fetch('/users/:id', {
  method: 'DELETE',
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

*Generated on 2025-05-28T13:50:53.522Z*
