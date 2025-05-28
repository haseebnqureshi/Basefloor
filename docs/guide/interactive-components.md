# Interactive Components

This page demonstrates the interactive components available in the Basefloor documentation. These components make it easier to understand, configure, and test Basefloor APIs.

## Configuration Builder

The Configuration Builder provides a visual interface for creating Basefloor configuration files. You can build your configuration step-by-step and export it when ready.

<ConfigBuilder />

## API Explorer

The API Explorer allows you to test API endpoints directly in the documentation. Here's an example for creating a user:

<APIExplorer 
  method="POST" 
  endpoint="/users" 
  :requiresAuth="false"
  sampleBody='{"email": "user@example.com", "password": "securePassword123"}'
/>

### Testing with Authentication

Here's an example that requires authentication:

<APIExplorer 
  method="GET" 
  endpoint="/users/:id" 
  :requiresAuth="true"
/>

## Code Examples

The Code Example component shows the same functionality in multiple programming languages and frameworks.

### Basic API Call Example

Here's how to make a POST request to create a user in different languages:

```javascript
// JavaScript (fetch)
fetch('http://localhost:3000/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

```bash
# cURL
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

```python
# Python (requests)
import requests

url = 'http://localhost:3000/users'
data = {
    'email': 'user@example.com',
    'password': 'securePassword123'
}

response = requests.post(url, json=data)
print(response.json())
```

```javascript
// Node.js (axios)
const axios = require('axios');

const userData = {
  email: 'user@example.com',
  password: 'securePassword123'
};

axios.post('http://localhost:3000/users', userData)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error.response?.data || error.message);
  });
```

### Configuration Examples

#### Basic Configuration

```javascript
module.exports = {
  port: 3000,
  database: {
    uri: 'mongodb://localhost:27017/myapp'
  },
  jwt: {
    secret: 'your-secret-key'
  },
  models: {
    Users: {
      fields: {
        email: { type: String, required: true },
        password: { type: String, required: true }
      }
    }
  },
  routes: {
    '/users': {
      model: 'Users',
      c: { allow: true },
      rA: { allow: true },
      r: { allow: true },
      u: { allow: '@user._id=@req_user._id' },
      d: { allow: '@user._id=@req_user._id' }
    }
  }
};
```

#### Advanced Configuration

```javascript
module.exports = {
  port: process.env.PORT || 3000,
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp'
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d'
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
  },
  models: {
    Users: {
      fields: {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: 'user', enum: ['user', 'admin'] },
        profile: {
          firstName: String,
          lastName: String,
          avatar: String
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
      },
      filters: {
        own: '@user._id=@req_user._id',
        public: { password: 0 }
      }
    },
    Posts: {
      fields: {
        title: { type: String, required: true },
        content: { type: String, required: true },
        author: { type: 'ObjectId', ref: 'Users', required: true },
        published: { type: Boolean, default: false },
        tags: [String],
        createdAt: { type: Date, default: Date.now }
      }
    }
  },
  routes: {
    '/users': {
      model: 'Users',
      c: { allow: true },
      rA: { 
        allow: '@req_user.role=admin',
        filter: 'public'
      },
      r: { 
        allow: true,
        filter: 'public'
      },
      u: { 
        allow: '@user._id=@req_user._id',
        filter: 'own'
      },
      d: { 
        allow: '(@user._id=@req_user._id)||(@req_user.role=admin)'
      }
    },
    '/posts': {
      model: 'Posts',
      c: { 
        allow: '@req_user',
        defaults: { author: '@req_user._id' }
      },
      rA: { allow: true },
      r: { allow: true },
      u: { allow: '@post.author=@req_user._id' },
      d: { allow: '(@post.author=@req_user._id)||(@req_user.role=admin)' }
    }
  }
};
```

## Benefits of Interactive Components

These interactive components provide several advantages:

1. **Faster Learning**: Visual and interactive elements help developers understand concepts more quickly
2. **Reduced Errors**: Configuration builder prevents syntax errors and validates inputs
3. **Immediate Testing**: API explorer eliminates the need for external tools like Postman
4. **Multi-Language Support**: Code examples show the same concept in different languages
5. **Copy-Paste Ready**: All code examples are ready to use in your projects

## Next Steps

- Try building a configuration using the Configuration Builder
- Test some API endpoints with the API Explorer  
- Copy code examples for your preferred language/framework
- Check out the [API Reference](/api/routes/) for complete endpoint documentation 