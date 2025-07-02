# Express-based Architecture

BasefloorAPI is built on top of Express.js, giving you access to the full power and flexibility of the Express ecosystem while providing additional abstractions for rapid API development.

## Why Express.js?

Express.js provides the foundation that makes BasefloorAPI both powerful and familiar:

- **Maximum Flexibility** - Use any Express middleware or patterns
- **Proven Performance** - Battle-tested in production environments
- **Rich Ecosystem** - Access to thousands of Express-compatible packages
- **Developer Familiarity** - Leverage existing Express.js knowledge

## Direct Express Access

BasefloorAPI exposes the underlying Express application, giving you complete control when needed:

```javascript
const BasefloorAPI = require('@basefloor/api');

const API = BasefloorAPI({
  config: require('./basefloor.config.js')
});

// Direct access to Express app
API.use('/api/v1', (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Express Router for modular organization
const router = API.express.Router();
router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

API.use('/api/v1', router);
```

## Express Features in BasefloorAPI

### Custom Middleware

Create and use custom middleware for cross-cutting concerns:

```javascript
// Rate limiting middleware
const rateLimiter = (limit = 10, windowMs = 60000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip;
    const now = Date.now();
    
    if (!requests.has(clientId)) {
      requests.set(clientId, []);
    }
    
    const clientRequests = requests.get(clientId);
    const validRequests = clientRequests.filter(
      timestamp => now - timestamp < windowMs
    );
    
    if (validRequests.length >= limit) {
      return res.status(429).json({
        error: 'Too many requests',
        retry_after: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }
    
    validRequests.push(now);
    requests.set(clientId, validRequests);
    next();
  };
};

// Apply rate limiting
API.use('/api/heavy', rateLimiter(5, 30000));
```

### Request/Response Streaming

Handle large data transfers efficiently with streaming:

```javascript
// Streaming response
API.get('/api/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  });
  
  let counter = 0;
  const interval = setInterval(() => {
    counter++;
    res.write(`Chunk ${counter}: ${new Date().toISOString()}\n`);
    
    if (counter >= 10) {
      clearInterval(interval);
      res.end('\nStream completed!\n');
    }
  }, 1000);
  
  req.on('close', () => clearInterval(interval));
});
```

### Server-Sent Events (SSE)

Real-time updates to clients using Server-Sent Events:

```javascript
API.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  // Send initial connection
  res.write(`data: ${JSON.stringify({ 
    type: 'connected', 
    timestamp: new Date() 
  })}\n\n`);
  
  // Periodic updates
  const interval = setInterval(() => {
    const data = {
      type: 'update',
      timestamp: new Date(),
      random_value: Math.random()
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 2000);
  
  req.on('close', () => clearInterval(interval));
});
```

### Error Handling

Comprehensive error handling with Express middleware:

```javascript
// Custom error handling middleware
API.use((error, req, res, next) => {
  console.error('Express Error:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      details: error.message
    });
  }
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      max_size: error.limit
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});
```

### Performance Monitoring

Built-in performance tracking and metrics:

```javascript
// Response time middleware
API.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
  });
  
  next();
});

// Metrics endpoint
API.get('/api/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    cpu_usage: process.cpuUsage(),
    platform: process.platform,
    node_version: process.version
  });
});
```

## Advanced Express Patterns

### Route Organization

Use Express routers for clean code organization:

```javascript
// Feature-specific router
const userRouter = API.express.Router();

userRouter.get('/', (req, res) => {
  // List users
});

userRouter.post('/', (req, res) => {
  // Create user
});

userRouter.get('/:id', (req, res) => {
  // Get specific user
});

// Mount router
API.use('/api/users', userRouter);
```

### Content Negotiation

Handle different content types and API versioning:

```javascript
// API versioning middleware
API.use((req, res, next) => {
  const version = req.headers['api-version'] || '1.0';
  req.apiVersion = version;
  res.setHeader('API-Version', version);
  next();
});

// Content type handling
API.get('/api/data/:id', (req, res) => {
  const { format = 'json' } = req.query;
  const data = { id: req.params.id, name: 'Example' };
  
  if (format === 'xml') {
    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0"?><item><id>${data.id}</id></item>`);
  } else {
    res.json(data);
  }
});
```

### Request Validation

Custom validation middleware:

```javascript
const validateJSON = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    if (!req.is('application/json')) {
      return res.status(400).json({
        error: 'Content-Type must be application/json'
      });
    }
  }
  next();
};

API.use('/api/data', validateJSON);
```

## Integration with BasefloorAPI Features

Express features work seamlessly with BasefloorAPI's built-in functionality:

```javascript
// Combine with BasefloorAPI authentication
API.get('/api/protected', [
  API.requireAuthentication,  // BasefloorAPI auth
  rateLimiter(10, 60000),     // Custom Express middleware
], (req, res) => {
  res.json({ 
    message: 'Authenticated and rate-limited endpoint',
    user: req.user 
  });
});

// Use with BasefloorAPI models
API.post('/api/custom-users', [
  API.requireAuthentication,
  validateJSON
], async (req, res) => {
  try {
    const user = await API.models.Users.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## Best Practices

### Middleware Order

```javascript
// Correct middleware order
API.use(express.json());        // Body parsing first
API.use(rateLimiter());         // Rate limiting
API.use(authMiddleware);        // Authentication
API.use('/api', apiRoutes);     // Routes
API.use(errorHandler);          // Error handling last
```

### Error Boundaries

```javascript
// Async error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

API.get('/api/async-route', asyncHandler(async (req, res) => {
  const data = await someAsyncOperation();
  res.json(data);
}));
```

### Performance Tips

- Use compression middleware for large responses
- Implement caching strategies with middleware
- Monitor memory usage in production
- Use clustering for CPU-intensive operations

## Example: Complete Express Integration

See the [complete Express example](../examples/express-advanced) for a full implementation showcasing:

- Custom middleware chains
- Rate limiting and validation
- Streaming responses
- Server-sent events
- Performance monitoring
- Error handling
- API versioning

The Express-based architecture gives you the freedom to build exactly what you need while leveraging BasefloorAPI's productivity features. 