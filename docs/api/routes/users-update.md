# PUT /users/:id

## update Users

### Endpoint

```
PUT /users/:id
```

### Authentication

🔒 Required

### Permissions

```json
"@user._id=@req_user._id"
```

### Request

```json
{

}
```

### Response

```json
{
  "modifiedCount": 1
}
```

### Example

```javascript
// Using fetch
const response = await fetch('/users/:id', {
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

*Generated on 2025-05-28T13:50:53.522Z*
