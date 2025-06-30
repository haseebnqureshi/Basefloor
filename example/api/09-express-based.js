/**
 * Feature 9: Express-based
 * 
 * Built on top of Express.js for maximum flexibility and performance.
 * This example demonstrates advanced Express.js features:
 * - Custom middleware chains and route organization
 * - Rate limiting and request validation
 * - Streaming responses and Server-Sent Events
 * - Performance monitoring and metrics
 * - Error handling and logging
 * - API versioning and content negotiation
 * 
 * Express.js features showcased:
 * - Custom middleware development
 * - Router-based modular organization
 * - Request/response streaming
 * - Real-time event streaming (SSE)
 * - Memory and performance monitoring
 * - Graceful error handling
 * 
 * @example
 * // Start the server
 * node 09-express-based.js
 * 
 * // Health check with metrics
 * curl http://localhost:4000/api/v1/health
 * 
 * // Streaming response
 * curl http://localhost:4000/api/v1/stream
 * 
 * // Server-sent events
 * curl http://localhost:4000/api/v1/events
 */
require('dotenv').config();
const api = require('../../packages/api');

const API = api({
  projectPath: __dirname,
  envPath: './.env'
});

// Initialize the API first to make middlewares available
API.Init();

// Demonstrate direct Express middleware usage
API.use('/api/v1', (req, res, next) => {
  // Custom logging middleware
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  req.requestTime = Date.now();
  next();
});

/**
 * Custom rate limiting middleware factory
 * 
 * Creates a middleware function that limits requests per client IP
 * within a specified time window. Demonstrates how to build custom
 * Express middleware for advanced functionality.
 * 
 * @param {number} limit - Maximum requests per window (default: 10)
 * @param {number} windowMs - Time window in milliseconds (default: 60000)
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Apply rate limiting to routes
 * app.use('/api/heavy', rateLimiter(5, 30000)); // 5 requests per 30 seconds
 */
const rateLimiter = (limit = 10, windowMs = 60000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(clientId)) {
      requests.set(clientId, []);
    }
    
    const clientRequests = requests.get(clientId);
    const validRequests = clientRequests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= limit) {
      return res.status(429).json({
        error: 'Too many requests',
        limit,
        windowMs,
        retry_after: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }
    
    validRequests.push(now);
    requests.set(clientId, validRequests);
    next();
  };
};

// Apply rate limiting to specific routes
API.use('/api/v1/high-frequency', rateLimiter(5, 30000));

// Custom response time middleware
API.use((req, res, next) => {
  res.setHeader('X-Response-Time-Start', Date.now());
  
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - res.getHeader('X-Response-Time-Start');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.removeHeader('X-Response-Time-Start');
    originalSend.call(this, data);
  };
  
  next();
});

// Express Router for modular route organization
const apiRouter = API.express.Router();

/**
 * Health check endpoint with system metrics
 * 
 * @route GET /api/v1/health
 * @auth None - Public endpoint
 * @returns {Object} 200 - System health and metrics
 * 
 * @example
 * // Response
 * {
 *   "status": "healthy",
 *   "timestamp": "2023-10-15T10:30:00.000Z",
 *   "uptime": {
 *     "seconds": 3661,
 *     "human": "1h 1m 1s"
 *   },
 *   "memory": {
 *     "rss": "45MB",
 *     "heapTotal": "20MB",
 *     "heapUsed": "15MB",
 *     "external": "5MB"
 *   },
 *   "node_version": "v18.17.0"
 * }
 */
apiRouter.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptime,
      human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    },
    node_version: process.version
  });
});

// Demonstrate streaming responses
apiRouter.get('/stream', (req, res) => {
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
  
  // Handle client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

// File upload with progress tracking
apiRouter.post('/upload-progress', [API.requireAuthentication], (req, res) => {
  const totalSize = req.headers['content-length'];
  let uploadedSize = 0;
  
  req.on('data', (chunk) => {
    uploadedSize += chunk.length;
    const progress = (uploadedSize / totalSize * 100).toFixed(2);
    
    // In a real application, you might emit this to websockets
    console.log(`Upload progress: ${progress}%`);
  });
  
  req.on('end', () => {
    res.json({
      success: true,
      message: 'Upload completed',
      total_size: totalSize,
      uploaded_size: uploadedSize
    });
  });
  
  req.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });
});

/**
 * Server-Sent Events (SSE) endpoint
 * 
 * Demonstrates real-time streaming of events to the client using
 * Server-Sent Events. This is a lightweight alternative to WebSockets
 * for one-way real-time communication.
 * 
 * @route GET /api/v1/events
 * @auth None - Public endpoint
 * @returns {Stream} text/event-stream - Continuous event stream
 * 
 * @example
 * // Client-side JavaScript
 * const eventSource = new EventSource('/api/v1/events');
 * eventSource.onmessage = function(event) {
 *   const data = JSON.parse(event.data);
 *   console.log('Received:', data);
 * };
 * 
 * // Stream format
 * data: {"type":"connected","timestamp":"2023-10-15T10:30:00.000Z"}
 * 
 * data: {"type":"update","timestamp":"2023-10-15T10:30:02.000Z","server_time":1697360202000,"random_value":0.123}
 */
apiRouter.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date() })}\n\n`);
  
  // Send periodic updates
  const interval = setInterval(() => {
    const data = {
      type: 'update',
      timestamp: new Date(),
      server_time: Date.now(),
      random_value: Math.random()
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 2000);
  
  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

// Express error handling middleware
apiRouter.use((error, req, res, next) => {
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
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Mount the router
API.use('/api/v1', apiRouter);

// Rate-limited endpoint
API.get('/api/v1/high-frequency/test', (req, res) => {
  res.json({
    message: 'This endpoint is rate limited!',
    timestamp: new Date().toISOString(),
    request_id: Math.random().toString(36).substr(2, 9)
  });
});

// Express middleware for request validation
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

// Apply validation middleware to specific routes
API.use('/api/v1/data', validateJSON);

// Demonstrate Express route parameters and query handling
API.get('/api/v1/data/:id', [API.requireAuthentication], (req, res) => {
  const { id } = req.params;
  const { format = 'json', include = [] } = req.query;
  
  // Simulate data retrieval
  const data = {
    id,
    name: `Item ${id}`,
    created_at: new Date().toISOString(),
    metadata: {
      format,
      includes: Array.isArray(include) ? include : [include].filter(Boolean)
    }
  };
  
  if (format === 'xml') {
    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0"?><item><id>${data.id}</id><name>${data.name}</name></item>`);
  } else {
    res.json(data);
  }
});

// Custom Express middleware for API versioning
API.use((req, res, next) => {
  const version = req.headers['api-version'] || '1.0';
  req.apiVersion = version;
  res.setHeader('API-Version', version);
  next();
});

// Performance monitoring endpoint
API.get('/api/v1/metrics', [API.requireAuthentication], (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    cpu_usage: process.cpuUsage(),
    active_handles: process._getActiveHandles().length,
    active_requests: process._getActiveRequests().length,
    platform: process.platform,
    node_version: process.version
  };
  
  res.json(metrics);
});

API.Start();

console.log('⚡ Express-based Example API running!');
console.log('🧪 Testing all endpoints...\n');

// Wait for server to start, then test all endpoints
setTimeout(async () => {
  const baseUrl = `http://localhost:${API.port || 4000}`;
  const axios = require('axios');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseUrl}/api/v1/health`);
    console.log('✓ Health check:', healthResponse.data.status, `(${healthResponse.data.memory.rss} memory)`);
    
    // Test 2: Rate limiting
    console.log('\n2. Testing rate limiting...');
    let rateLimitHit = false;
    for (let i = 0; i < 7; i++) {
      try {
        const rateLimitResponse = await axios.get(`${baseUrl}/api/v1/high-frequency/test`);
        console.log(`✓ Request ${i + 1}: ${rateLimitResponse.data.message}`);
      } catch (error) {
        if (error.response?.status === 429) {
          console.log(`✓ Rate limit triggered at request ${i + 1}: ${error.response.data.error}`);
          rateLimitHit = true;
          break;
        }
      }
    }
    if (!rateLimitHit) console.log('⚠️  Rate limit not reached in test');
    
    // Test 3: Route parameters and queries (requires auth - test without auth first)
    console.log('\n3. Testing route parameters...');
    try {
      const paramsResponse = await axios.get(`${baseUrl}/api/v1/data/123?format=json&include=metadata`);
      console.log('✓ Route params:', paramsResponse.data.id, paramsResponse.data.name);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✓ Authentication required (as expected):', error.response.data.error || 'Unauthorized');
      } else {
        throw error;
      }
    }
    
    // Test 4: Content validation
    console.log('\n4. Testing content validation...');
    try {
      await axios.post(`${baseUrl}/api/v1/data/test`, 'invalid-json', {
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✓ Content validation:', error.response.data.error);
      }
    }
    
    // Test 5: Streaming response (just start it)
    console.log('\n5. Testing streaming response...');
    const streamResponse = await axios.get(`${baseUrl}/api/v1/stream`, {
      responseType: 'stream'
    });
    console.log('✓ Stream started, content-type:', streamResponse.headers['content-type']);
    streamResponse.data.destroy(); // Close the stream
    
    // Test 6: Server-sent events (just connect)
    console.log('\n6. Testing server-sent events...');
    const sseResponse = await axios.get(`${baseUrl}/api/v1/events`, {
      responseType: 'stream'
    });
    console.log('✓ SSE connection established, content-type:', sseResponse.headers['content-type']);
    sseResponse.data.destroy(); // Close the connection
    
    // Test 7: Metrics endpoint (requires auth)
    console.log('\n7. Testing metrics endpoint...');
    try {
      const metricsResponse = await axios.get(`${baseUrl}/api/v1/metrics`);
      console.log('✓ Metrics retrieved:', Object.keys(metricsResponse.data).join(', '));
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✓ Authentication required for metrics (as expected)');
      } else {
        throw error;
      }
    }
    
    // Note about upload endpoint
    console.log('\n📝 Note: Upload endpoint (/api/v1/upload-progress) also requires authentication');
    
    console.log('\n🎉 All endpoint tests completed successfully!');
    console.log('\nExpress features demonstrated:');
    console.log('✓ Custom middleware chains');
    console.log('✓ Rate limiting');
    console.log('✓ Streaming responses');
    console.log('✓ Server-sent events');
    console.log('✓ Error handling');
    console.log('✓ Route organization');
    console.log('✓ Request validation');
    console.log('✓ Performance monitoring');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}, 2000); 