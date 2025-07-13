/**
 * Fixed auth middleware - converting _id to ObjectId for database lookup
 */

const path = require('path')
const { ObjectId } = require('mongodb')

// Initialize Basefloor
const basefloor = require('../../packages/api')
const API = basefloor({ 
  projectPath: __dirname,
  envPath: path.join(__dirname, '.env.example') 
})

// Initialize all systems
API.Init()

// Let's fix the requireAuthentication middleware
const originalRequireAuth = API.requireAuthentication

API.requireAuthentication = async (req, res, next) => {
  console.log('\n🔧 FIXED: requireAuthentication called')
  
  const { authorization } = req.headers
  let { token } = req.body
  
  try {
    // Token extraction (same as original)
    if (authorization) {
      const authToken = authorization.split('Bearer ')[1]
      if (!token && !authToken) {
        throw { code: 401, err: `missing token or malformed headers!` }
      } else if (!token && authToken) {
        token = authToken
      }
    }

    // Token validation (same as original)
    const decoded = await API.Utils.validateUserToken({ token })
    if (!decoded) { 
      throw { code: 401, err: `malformed, expired, or invalid token!` } 
    }
    
    req[decoded.sub] = decoded
    if (decoded.sub === 'auth') {
      req.user = decoded.user
    }

    // 🔧 FIX: Convert _id to ObjectId for database lookup
    if (API.Auth.enabled == true) {
      console.log('🔧 Step 5: Fetching live user data from database')
      const _id = req.user._id
      console.log('🔧 Original _id (string):', _id, typeof _id)
      
      // Convert to ObjectId if it's a string
      const objectId = typeof _id === 'string' ? new ObjectId(_id) : _id
      console.log('🔧 Converted _id (ObjectId):', objectId)
      
      const where = { _id: objectId }
      console.log('🔧 Calling API.DB.Users.read with ObjectId...')
      
      const user = await API.DB.Users.read({ where })
      console.log('🔧 Database user lookup result:', user ? user.email : 'NOT FOUND')
      
      if (!user) {
        console.log('❌ User still not found even with ObjectId conversion')
        throw { code: 401, err: `user not found!` }
      }
      
      req.user = user
      console.log('✅ Updated req.user with fresh database data')
    }

    console.log('✅ Authentication successful for:', req.user.email)
    next()
    
  } catch (err) {
    console.log('❌ Authentication failed:', err)
    API.Utils.errorHandler({ res, err })
  }
}

// Test routes
API.get('/fixed/auth-test', API.requireAuthentication, (req, res) => {
  res.json({ 
    message: 'FIXED AUTH WORKS!', 
    user: req.user.email,
    userId: req.user._id 
  })
})

// Test with our middleware
const { auth, models } = API.createMiddleware()

API.post('/fixed/todos', 
  API.requireAuthentication,  // Use the fixed auth
  models.Todos.injectUser,
  models.Todos.validate,
  async (req, res) => {
    try {
      console.log('📋 Creating todo for user:', req.user._id)
      const todo = await models.Todos.create(req.body)
      res.json({ success: true, todo, message: 'Todo created with FIXED auth!' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

API.listen(4007, () => {
  console.log(`
🔧 FIXED Auth Server running on port 4007!

Test sequence:
1. Register: curl -X POST http://localhost:4007/register -H "Content-Type: application/json" -d '{"email":"fixed@example.com","password":"password123"}'
2. Login: curl -X POST http://localhost:4007/login -H "Content-Type: application/json" -d '{"email":"fixed@example.com","password":"password123"}'
3. Test fixed auth: curl -H "Authorization: Bearer TOKEN" http://localhost:4007/fixed/auth-test
4. Test todo creation: curl -X POST http://localhost:4007/fixed/todos -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -d '{"title":"success"}'

This should work with the ObjectId conversion fix!
`)
})