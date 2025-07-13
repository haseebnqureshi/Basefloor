/**
 * Simple test without auth to verify our Express routes work
 */

const path = require('path')

// Initialize Basefloor
const basefloor = require('../../packages/api')
const API = basefloor({ 
  projectPath: __dirname,
  envPath: path.join(__dirname, '.env.example') 
})

// Initialize all systems
API.Init()

// Get middleware
const { auth, models, permissions } = API.createMiddleware()

// Test route WITHOUT auth to verify basic functionality
API.get('/test-route', async (req, res) => {
  res.json({ message: 'Express-first route works!', timestamp: new Date() })
})

// Test route WITH models but no auth
API.post('/test-todo', 
  models.Todos.validate,
  async (req, res) => {
    try {
      // Manually set userId for testing
      const testData = { ...req.body, userId: '507f1f77bcf86cd799439011' }
      const todo = await models.Todos.create(testData)
      res.json({ success: true, todo })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

// Start server
API.listen(4002, () => {
  console.log('🧪 Simple test server running on port 4002')
  console.log('📋 Test routes:')
  console.log('  GET  http://localhost:4002/test-route')
  console.log('  POST http://localhost:4002/test-todo {"title": "test"}')
  console.log('  POST http://localhost:4002/register {"email": "test@example.com", "password": "password123"}')
})