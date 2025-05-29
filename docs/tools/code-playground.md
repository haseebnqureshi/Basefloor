# Code Playground

The Code Playground provides multi-language code examples for common Basefloor operations. All examples are copy-paste ready and show the same functionality across different programming languages and frameworks.

> **💡 Environment Configuration**
> 
> Examples below use `https://api.yourdomain.com` for production. For development, replace with `http://localhost:3000` (or your configured port).

## Basic API Operations

### Creating a User

Here's how to create a user in different languages:

```javascript
// JavaScript (fetch)
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.yourdomain.com';

fetch(`${API_BASE_URL}/users`, {
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
# Development
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'

# Production
curl -X POST https://api.yourdomain.com/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

```python
# Python (requests)
import os
import requests

# Configure base URL from environment or use default
API_BASE_URL = os.getenv('API_BASE_URL', 'https://api.yourdomain.com')

url = f'{API_BASE_URL}/users'
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

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.yourdomain.com';

const userData = {
  email: 'user@example.com',
  password: 'securePassword123'
};

axios.post(`${API_BASE_URL}/users`, userData)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error.response?.data || error.message);
  });
```

### Authentication & JWT Tokens

Login and use JWT tokens for authenticated requests:

```javascript
// JavaScript - Login and store token
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.yourdomain.com';

async function loginAndStoreToken() {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'securePassword123'
    })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.token;
}

// Make authenticated request
async function getProfile() {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

```python
# Python - Login and authenticated requests
import os
import requests

API_BASE_URL = os.getenv('API_BASE_URL', 'https://api.yourdomain.com')

# Login
login_response = requests.post(f'{API_BASE_URL}/auth/login', json={
    'email': 'user@example.com',
    'password': 'securePassword123'
})

token = login_response.json()['token']

# Authenticated request
headers = {'Authorization': f'Bearer {token}'}
profile_response = requests.get(f'{API_BASE_URL}/users/me', headers=headers)
print(profile_response.json())
```

```bash
# cURL - Login and use token
# Set your API base URL
API_BASE_URL="https://api.yourdomain.com"  # Production
# API_BASE_URL="http://localhost:3000"     # Development

# First, login and extract token
TOKEN=$(curl -s -X POST ${API_BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securePassword123"}' \
  | jq -r '.token')

# Use token for authenticated request
curl -H "Authorization: Bearer $TOKEN" \
  ${API_BASE_URL}/users/me
```

### CRUD Operations

Complete Create, Read, Update, Delete examples:

```javascript
// JavaScript - Complete CRUD operations
class BasefloorAPI {
  constructor(baseURL = process.env.API_BASE_URL || 'https://api.yourdomain.com') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      },
      ...options
    };

    const response = await fetch(url, config);
    return response.json();
  }

  // Create
  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Read All
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users${query ? `?${query}` : ''}`);
  }

  // Read One
  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  // Update
  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // Delete
  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }
}

// Usage
const api = new BasefloorAPI();

// Create a user
const newUser = await api.createUser({
  email: 'john@example.com',
  password: 'password123'
});

// Get all users
const users = await api.getUsers({ limit: 10 });

// Update user
const updatedUser = await api.updateUser(newUser._id, {
  email: 'john.doe@example.com'
});

// Delete user
await api.deleteUser(newUser._id);
```

```python
# Python - CRUD operations class
import os
import requests
from typing import Dict, Any, Optional

class BasefloorAPI:
    def __init__(self, base_url: str = None):
        self.base_url = base_url or os.getenv('API_BASE_URL', 'https://api.yourdomain.com')
        self.token = None
    
    def set_token(self, token: str):
        self.token = token
    
    def _request(self, endpoint: str, method: str = 'GET', data: Optional[Dict] = None) -> Dict[Any, Any]:
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        response = requests.request(method, url, json=data, headers=headers)
        return response.json()
    
    # CRUD operations
    def create_user(self, user_data: Dict) -> Dict:
        return self._request('/users', 'POST', user_data)
    
    def get_users(self, params: Optional[Dict] = None) -> Dict:
        endpoint = '/users'
        if params:
            query = '&'.join([f"{k}={v}" for k, v in params.items()])
            endpoint += f"?{query}"
        return self._request(endpoint)
    
    def get_user(self, user_id: str) -> Dict:
        return self._request(f'/users/{user_id}')
    
    def update_user(self, user_id: str, user_data: Dict) -> Dict:
        return self._request(f'/users/{user_id}', 'PUT', user_data)
    
    def delete_user(self, user_id: str) -> Dict:
        return self._request(f'/users/{user_id}', 'DELETE')

# Usage example
api = BasefloorAPI()

# Create user
new_user = api.create_user({
    'email': 'john@example.com',
    'password': 'password123'
})

# Get users with pagination
users = api.get_users({'limit': 10, 'offset': 0})

# Update user
updated_user = api.update_user(new_user['_id'], {
    'email': 'john.doe@example.com'
})

# Delete user
api.delete_user(new_user['_id'])
```

## Configuration Examples

### Basic Configuration

```javascript
// basefloor.config.js - Basic setup
module.exports = {
  port: process.env.PORT || 3000,
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['https://yourdomain.com']
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

### Advanced Configuration

```javascript
// basefloor.config.js - Production-ready setup
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
    origins: process.env.CORS_ORIGINS?.split(',') || ['https://yourdomain.com']
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

## Environment Variables

Set up your environment variables for different environments:

### Development (.env.local)
```bash
API_BASE_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/myapp-dev
JWT_SECRET=dev-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Production (.env.production)
```bash
API_BASE_URL=https://api.yourdomain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/myapp
JWT_SECRET=your-secure-production-secret
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## Framework Integration

### React Integration

```jsx
// React hooks for Basefloor API
import { useState, useEffect } from 'react';

// Custom hook for API calls
function useBasefloorAPI(baseURL = process.env.REACT_APP_API_BASE_URL || 'https://api.yourdomain.com') {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const api = async (endpoint, options = {}) => {
    const response = await fetch(`${baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...options
    });
    return response.json();
  };

  const login = async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return { api, login, logout, token };
}

// Component example
function UserList() {
  const [users, setUsers] = useState([]);
  const { api } = useBasefloorAPI();

  useEffect(() => {
    api('/users').then(setUsers);
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user._id}>{user.email}</div>
      ))}
    </div>
  );
}
```

### Vue.js Integration

```vue
<!-- Vue.js component with Basefloor API -->
<template>
  <div>
    <div v-for="user in users" :key="user._id">
      {{ user.email }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const users = ref([]);
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.yourdomain.com';

    const api = async (endpoint, options = {}) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...options
      });
      return response.json();
    };

    onMounted(async () => {
      users.value = await api('/users');
    });

    return { users };
  }
};
</script>
```

## Error Handling

### Robust Error Handling

```javascript
// JavaScript - Comprehensive error handling
class BasefloorAPIWithErrorHandling {
  constructor(baseURL = process.env.API_BASE_URL || 'https://api.yourdomain.com') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        ...options
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(response.status, errorData.message || 'Request failed', errorData);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(0, 'Network error', { originalError: error.message });
    }
  }
}

class APIError extends Error {
  constructor(status, message, data = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Usage with error handling
async function handleAPICall() {
  try {
    const api = new BasefloorAPIWithErrorHandling();
    const users = await api.request('/users');
    console.log('Success:', users);
  } catch (error) {
    if (error instanceof APIError) {
      switch (error.status) {
        case 401:
          console.error('Authentication required');
          // Redirect to login
          break;
        case 403:
          console.error('Permission denied');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API Error:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

## Testing Examples

### Unit Testing with Jest

```javascript
// Jest tests for Basefloor API
const BasefloorAPI = require('./basefloor-api');

describe('BasefloorAPI', () => {
  let api;

  beforeEach(() => {
    api = new BasefloorAPI('https://api.yourdomain.com');
    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should create user successfully', async () => {
    const mockUser = { _id: '123', email: 'test@example.com' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    });

    const result = await api.createUser({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(result).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.yourdomain.com/users',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    );
  });
});
```

## Next Steps

1. **Configure your environment variables** for development and production
2. **Copy the examples** that match your technology stack
3. **Replace `yourdomain.com`** with your actual domain
4. **Test your integration** using the [API Explorer](/tools/api-explorer)
5. **Build your application** using these patterns as a foundation

## Integration with Other Tools

- **Configuration Builder**: Generate the config files shown in these examples
- **API Explorer**: Test the endpoints before implementing them in code
- **Examples**: See these patterns in action with complete applications

---

*All code examples are production-ready and include proper error handling, authentication, and environment configuration. Remember to replace `yourdomain.com` with your actual domain.* 