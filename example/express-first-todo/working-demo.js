/**
 * Working Demo: Express-first Todo API
 * This demonstrates the complete integration working properly
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

// Get Express middleware
const { auth, models, permissions } = API.createMiddleware()

console.log('🔧 Setting up Express-first routes...')

// ✅ Todo routes using Express patterns
API.post('/api/todos', 
  auth.required,                    // Basefloor auth middleware  
  models.Todos.injectUser,          // Auto-inject userId
  models.Todos.validate,            // Schema validation
  async (req, res) => {
    try {
      console.log('Creating todo for user:', req.user._id)
      const todo = await models.Todos.create(req.body)
      res.json({ success: true, todo })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

API.get('/api/todos',
  auth.required,
  async (req, res) => {
    try {
      console.log('Getting todos for user:', req.user._id)
      const todos = await models.Todos.readAll({ userId: req.user._id })
      res.json({ todos })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

API.get('/api/todos/:id',
  auth.required,
  async (req, res) => {
    try {
      const todo = await models.Todos.read({ 
        _id: req.params.id,
        userId: req.user._id
      })
      
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found or not owned by user' })
      }
      
      res.json({ todo })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

// Health check route
API.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Express-first Basefloor API is running!',
    timestamp: new Date(),
    routes: [
      'POST /register - User registration',
      'POST /login - User authentication',
      'GET /user - Get current user (auth required)',
      'POST /api/todos - Create todo (auth required)',
      'GET /api/todos - List user todos (auth required)',
      'GET /api/todos/:id - Get specific todo (auth required)'
    ]
  })
})

// Start server
API.listen(4003, () => {
  console.log(`
🚀 Express-First Todo API Demo running on port 4003!

📋 Available endpoints:
┌─────────────────────────────────────────────────────────────┐
│ Health & Info                                               │
├─────────────────────────────────────────────────────────────┤
│ GET  http://localhost:4003/api/health                       │
├─────────────────────────────────────────────────────────────┤
│ Authentication (built-in Basefloor routes)                 │
├─────────────────────────────────────────────────────────────┤
│ POST http://localhost:4003/register                        │
│ POST http://localhost:4003/login                           │ 
│ GET  http://localhost:4003/user                            │
├─────────────────────────────────────────────────────────────┤
│ Todos (Express-first routes)                               │
├─────────────────────────────────────────────────────────────┤
│ POST http://localhost:4003/api/todos                       │
│ GET  http://localhost:4003/api/todos                       │
│ GET  http://localhost:4003/api/todos/:id                   │
└─────────────────────────────────────────────────────────────┘

🧪 Test the complete flow:
   1. Register: curl -X POST http://localhost:4003/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}'
   2. Login:    curl -X POST http://localhost:4003/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}'
   3. Create:   curl -X POST http://localhost:4003/api/todos -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -d '{"title":"My first Express-first todo"}'
   4. List:     curl -X GET http://localhost:4003/api/todos -H "Authorization: Bearer TOKEN"
`)
})