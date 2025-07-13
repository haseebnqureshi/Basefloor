/**
 * Debug the built-in auth middleware to find the exact failure point
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

// Let's monkey-patch the requireAuthentication middleware to add debug logging
const originalRequireAuth = API.requireAuthentication

API.requireAuthentication = async (req, res, next) => {
  console.log('\n🔍 DEBUG: requireAuthentication called')
  console.log('🔍 Headers:', req.headers.authorization ? 'Bearer token present' : 'No auth header')
  
  const { authorization } = req.headers
  let { token } = req.body
  
  try {
    console.log('🔍 Step 1: Token extraction')
    
    //only if we even have authorization headers (which we may not for reset and verifications)
    if (authorization) {
      console.log('🔍 Authorization header found:', authorization.substring(0, 20) + '...')
      const authToken = authorization.split('Bearer ')[1]
      console.log('🔍 Extracted token:', authToken ? authToken.substring(0, 20) + '...' : 'NULL')
      
      if (!token && !authToken) {
        console.log('❌ No token found in header or body')
        throw { code: 401, err: `missing token or malformed headers!` }
      } else if (!token && authToken) {
        token = authToken
        console.log('✅ Using token from authorization header')
      }
    } else {
      console.log('🔍 No authorization header, checking body token:', !!token)
    }

    console.log('🔍 Step 2: Token validation')
    console.log('🔍 Calling API.Utils.validateUserToken with token:', token ? token.substring(0, 20) + '...' : 'NULL')
    
    //checking token validity
    const decoded = await API.Utils.validateUserToken({ token })
    console.log('🔍 Token validation result:', decoded ? 'SUCCESS' : 'FAILED')
    
    if (decoded) {
      console.log('🔍 Decoded token sub:', decoded.sub)
      console.log('🔍 Decoded user:', decoded.user ? decoded.user.email : 'NO USER')
    }
    
    if (!decoded) { 
      console.log('❌ Token validation failed')
      throw { code: 401, err: `malformed, expired, or invalid token!` } 
    }
    
    console.log('🔍 Step 3: Setting request properties')
    req[decoded.sub] = decoded
    if (decoded.sub === 'auth') {
      req.user = decoded.user
      console.log('✅ Set req.user to:', req.user.email)
    }

    console.log('🔍 Step 4: Checking if Auth.enabled')
    console.log('🔍 API.Auth.enabled:', API.Auth.enabled)

    /*
    Now if our authentication service is enabled on this config, we then additionally
    pull live user data. Otherwise, we rely on what is decoded from our JWT.
    */

    if (API.Auth.enabled == true) {
      console.log('🔍 Step 5: Fetching live user data from database')
      //now ensuring user is validated, pulling right from the db
      //this prevents stale data gaining access and more live auth states
      const _id = req.user._id
      console.log('🔍 Looking up user with _id:', _id)
      const where = { _id }
      
      console.log('🔍 Calling API.DB.Users.read...')
      const user = await API.DB.Users.read({ where })
      console.log('🔍 Database user lookup result:', user ? user.email : 'NOT FOUND')
      
      if (!user) {
        console.log('❌ User not found in database')
        throw { code: 401, err: `user not found!` }
      }
      
      req.user = user
      console.log('✅ Updated req.user with fresh database data')
    } else {
      console.log('🔍 Auth not enabled, using JWT user data only')
    }

    console.log('✅ Authentication successful for:', req.user.email)
    next()
    
  } catch (err) {
    console.log('❌ Authentication failed:', err)
    console.log('❌ Error details:', JSON.stringify(err, null, 2))
    API.Utils.errorHandler({ res, err })
  }
}

// Test routes
API.get('/debug/auth-test', API.requireAuthentication, (req, res) => {
  res.json({ 
    message: 'Auth test successful!', 
    user: req.user.email,
    userId: req.user._id 
  })
})

API.get('/debug/no-auth', (req, res) => {
  res.json({ message: 'No auth required - server working' })
})

API.listen(4006, () => {
  console.log(`
🔍 Auth Debug Server running on port 4006!

Test sequence:
1. curl http://localhost:4006/debug/no-auth
2. Register: curl -X POST http://localhost:4006/register -H "Content-Type: application/json" -d '{"email":"debug@example.com","password":"password123"}'
3. Login: curl -X POST http://localhost:4006/login -H "Content-Type: application/json" -d '{"email":"debug@example.com","password":"password123"}'
4. Test auth: curl -H "Authorization: Bearer TOKEN" http://localhost:4006/debug/auth-test

Watch the console for detailed debug output!
`)
})