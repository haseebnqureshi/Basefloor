# GET /convert/:to

## check-conversion Files

### Endpoint

```
GET /convert/:to
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
{
  "extension": ".pdf",
  "accepted": true,
  "to": ".png"
}
```

### Example

```javascript
// Using fetch
const response = await fetch('/convert/:to', {
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
