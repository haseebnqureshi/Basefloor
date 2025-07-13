/**
 * Final working demo - let's make this work!
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

// Create a custom auth middleware that we KNOW works
const customAuth = async (req, res, next) => {
  const { authorization } = req.headers
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' })
  }
  
  const token = authorization.split('Bearer ')[1]
  
  try {
    // Use the same validation logic but with debugging
    console.log('🔍 Validating token:', token.substring(0, 20) + '...')
    
    const decoded = await API.Utils.validateUserToken({ token })
    console.log('🔍 Validation result:', decoded ? 'SUCCESS' : 'FAILED')
    
    if (!decoded) {
      console.log('🔍 Token validation failed - trying direct decode...')
      
      // Try direct JWT decode for debugging
      const jwt = require('jsonwebtoken')
      try {
        const directDecode = jwt.decode(token)
        console.log('🔍 Direct decode (no verification):', directDecode?.user?.email || 'FAILED')
      } catch (e) {
        console.log('🔍 Even direct decode failed:', e.message)
      }
      
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    req.user = decoded.user
    console.log('🔍 Auth successful for user:', req.user?.email)
    next()
    
  } catch (error) {
    console.log('🔍 Auth middleware error:', error.message)
    res.status(401).json({ error: 'Authentication failed' })
  }
}

// Test routes with both auth methods
API.get('/test/builtin-auth', auth.required, (req, res) => {
  res.json({ message: 'Built-in auth works!', user: req.user?.email })
})

API.get('/test/custom-auth', customAuth, (req, res) => {
  res.json({ message: 'Custom auth works!', user: req.user?.email })
})

API.post('/api/todos', 
  customAuth,  // Use our custom auth instead
  models.Todos.injectUser,
  models.Todos.validate,
  async (req, res) => {
    try {
      console.log('📋 Creating todo for user:', req.user._id)
      const todo = await models.Todos.create(req.body)
      res.json({ success: true, todo })
    } catch (error) {
      console.log('📋 Todo creation error:', error.message)
      res.status(500).json({ error: error.message })
    }
  }
)

API.get('/api/todos', 
  customAuth,
  async (req, res) => {
    try {
      console.log('📋 Getting todos for user:', req.user._id)
      const todos = await models.Todos.readAll({ userId: req.user._id })
      res.json({ todos })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

// Health check
API.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Working final demo!',
    endpoints: [
      'POST /register',
      'POST /login', 
      'GET /test/builtin-auth (test built-in auth)',
      'GET /test/custom-auth (test custom auth)',
      'POST /api/todos (custom auth)',
      'GET /api/todos (custom auth)'
    ]
  })
})

API.listen(4005, () => {
  console.log(`
🚀 Working Final Demo on port 4005!

🧪 Test sequence:
1. curl -X POST http://localhost:4005/register -H "Content-Type: application/json" -d '{"email":"final@example.com","password":"password123"}'
2. curl -X POST http://localhost:4005/login -H "Content-Type: application/json" -d '{"email":"final@example.com","password":"password123"}'
3. Copy the token from step 2
4. curl -H "Authorization: Bearer TOKEN" http://localhost:4005/test/builtin-auth
5. curl -H "Authorization: Bearer TOKEN" http://localhost:4005/test/custom-auth
6. curl -X POST http://localhost:4005/api/todos -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -d '{"title":"Final test todo"}'
`)
})