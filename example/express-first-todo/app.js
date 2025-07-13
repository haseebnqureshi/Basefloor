/**
 * Express-First Todo API using Basefloor
 * 
 * This example shows how to use Basefloor with familiar Express patterns
 * instead of the complex DSL routing system.
 * 
 * Features:
 * - Standard Express routes
 * - Basefloor auth middleware
 * - Model validation (TODO: will be enhanced in Week 2)
 * - User-owned todos with proper permissions
 */

const path = require('path')

// Initialize Basefloor (existing approach)
const basefloor = require('../../packages/api')
const API = basefloor({ 
  projectPath: __dirname,
  envPath: path.join(__dirname, '.env') 
})

// Initialize all Basefloor systems
API.Init()

// ✨ NEW: Get Express middleware from Basefloor
const { auth, models, permissions } = API.createMiddleware()

// 🎯 Standard Express routes with Basefloor superpowers

// Auto-generated auth routes (register, login, user info)
// These are created by the existing auth system
console.log('Auth routes automatically available:')
console.log('POST /register - User registration')
console.log('POST /login - User authentication') 
console.log('GET /user - Get current user info')
console.log('PUT /user - Update user')
console.log('DELETE /user - Delete user')

// ✅ Todo routes using familiar Express patterns
API.post('/todos', 
  auth.required,                    // Basefloor auth middleware  
  models.Todos.injectUser,          // Auto-inject userId
  models.Todos.validate,            // Schema validation (basic for now)
  async (req, res) => {
    try {
      const todo = await models.Todos.create(req.body)
      res.json(todo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

API.get('/todos',
  auth.required,
  async (req, res) => {
    try {
      // Get only the user's todos
      const todos = await models.Todos.readAll({ userId: req.user._id })
      res.json(todos)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

API.get('/todos/:id',
  auth.required,
  permissions.check('Todos', 'read'),   // Basic permission check
  async (req, res) => {
    try {
      const todo = await models.Todos.read({ 
        _id: req.params.id,
        userId: req.user._id  // Ensure user owns this todo
      })
      
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' })
      }
      
      res.json(todo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

API.put('/todos/:id',
  auth.required,
  models.Todos.validate,
  async (req, res) => {
    try {
      const todo = await models.Todos.update(
        { 
          _id: req.params.id,
          userId: req.user._id  // Ensure user owns this todo
        },
        req.body
      )
      
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' })
      }
      
      res.json({ message: 'Todo updated', todo })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

API.delete('/todos/:id',
  auth.required,
  async (req, res) => {
    try {
      const result = await models.Todos.delete({ 
        _id: req.params.id,
        userId: req.user._id  // Ensure user owns this todo
      })
      
      res.json({ message: 'Todo deleted' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

// 💡 Custom middleware example - this is how developers add custom logic
const logTodoActions = (req, res, next) => {
  console.log(`Todo action: ${req.method} ${req.path} by user ${req.user?._id}`)
  next()
}

// You can easily add custom middleware to any route
API.post('/todos/bulk',
  auth.required,
  logTodoActions,                   // Custom middleware
  models.Todos.injectUser,
  async (req, res) => {
    try {
      const { todos } = req.body
      const createdTodos = await Promise.all(
        todos.map(todo => models.Todos.create({
          ...todo,
          userId: req.user._id
        }))
      )
      res.json(createdTodos)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

// 📊 Add a stats endpoint to show the power of mixing approaches
API.get('/stats',
  auth.required,
  async (req, res) => {
    try {
      const totalTodos = await models.Todos.readAll({ userId: req.user._id })
      const completedTodos = await models.Todos.readAll({ 
        userId: req.user._id, 
        completed: true 
      })
      
      res.json({
        total: totalTodos.length,
        completed: completedTodos.length,
        remaining: totalTodos.length - completedTodos.length,
        user: req.user.email
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

// Start the server
API.Start()

console.log(`
🚀 Express-First Todo API running on port 4001!

Try these endpoints:
┌─────────────────────────────────────────────────────────────┐
│ Authentication                                              │
├─────────────────────────────────────────────────────────────┤
│ POST http://localhost:4001/register  { email, password }   │
│ POST http://localhost:4001/login     { email, password }   │
│ GET  http://localhost:4001/user      (requires auth)       │
├─────────────────────────────────────────────────────────────┤
│ Todos                                                       │
├─────────────────────────────────────────────────────────────┤
│ POST http://localhost:4001/todos     { title }      (auth) │
│ GET  http://localhost:4001/todos                    (auth) │
│ GET  http://localhost:4001/todos/:id                (auth) │
│ PUT  http://localhost:4001/todos/:id { title, completed }  │
│ DELETE http://localhost:4001/todos/:id              (auth) │
│ POST http://localhost:4001/todos/bulk { todos: [...] }     │
│ GET  http://localhost:4001/stats                    (auth) │
└─────────────────────────────────────────────────────────────┘

🔑 Don't forget to include Authorization: Bearer <token> header
   after login for authenticated endpoints!

🧪 Test with: node demo.js
`)