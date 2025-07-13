/**
 * JWT Debug - figure out why tokens aren't validating
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

console.log('🔍 JWT Debug Information:')
console.log('Project secret:', API.project?.app?.secret || 'UNDEFINED')

// Test token creation and validation manually
const testJWT = async () => {
  try {
    console.log('\n1️⃣ Testing manual JWT creation...')
    
    // Create a test token
    const testPayload = { user: { _id: 'test123', email: 'test@example.com' } }
    const testToken = await API.Utils.createUserAuthToken({ user: testPayload.user })
    console.log('✅ Token created:', testToken?.substring(0, 50) + '...')
    
    // Try to validate it
    console.log('\n2️⃣ Testing token validation...')
    const decoded = await API.Utils.validateUserToken({ token: testToken })
    console.log('✅ Token validation result:', decoded ? 'SUCCESS' : 'FAILED')
    if (decoded) {
      console.log('   Decoded user:', decoded.user?.email)
    }
    
    // Test with middleware
    console.log('\n3️⃣ Testing middleware extraction...')
    const { auth } = API.createMiddleware()
    console.log('✅ Auth middleware type:', typeof auth.required)
    
    return testToken
    
  } catch (error) {
    console.error('❌ JWT test failed:', error.message)
    return null
  }
}

// Start server with debug endpoint
API.get('/debug/jwt', async (req, res) => {
  const token = await testJWT()
  res.json({
    secret: API.project?.app?.secret || 'undefined',
    tokenCreated: !!token,
    utilsAvailable: {
      createUserAuthToken: typeof API.Utils.createUserAuthToken,
      validateUserToken: typeof API.Utils.validateUserToken,
      validateToken: typeof API.Utils.validateToken,
      createToken: typeof API.Utils.createToken
    }
  })
})

// Test actual registration and login flow
API.post('/debug/test-flow', async (req, res) => {
  try {
    // Create test user manually
    const testUser = {
      email: 'debug@example.com',
      password_hash: await API.Auth.hashPassword('password123'),
      _id: 'debug123'
    }
    
    // Create token for this user
    const token = await API.Utils.createUserAuthToken({ user: testUser })
    console.log('🔍 Created token for debug user:', token?.substring(0, 50) + '...')
    
    // Try to validate it
    const validation = await API.Utils.validateUserToken({ token })
    console.log('🔍 Validation result:', validation ? 'SUCCESS' : 'FAILED')
    
    res.json({
      user: testUser.email,
      tokenCreated: !!token,
      tokenValid: !!validation,
      validationResult: validation
    })
    
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

API.listen(4004, async () => {
  console.log('\n🚀 JWT Debug server running on port 4004')
  console.log('📋 Debug endpoints:')
  console.log('   GET  http://localhost:4004/debug/jwt')
  console.log('   POST http://localhost:4004/debug/test-flow')
  
  // Run immediate test
  await testJWT()
})