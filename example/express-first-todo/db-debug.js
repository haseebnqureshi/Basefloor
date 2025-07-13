/**
 * Debug the database to see what's actually stored
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

// Test endpoint to debug what's in the database
API.get('/debug/database', async (req, res) => {
  try {
    console.log('🔍 DEBUG: Checking what users are in the database...')
    
    // Try to get all users
    const allUsers = await API.DB.Users.readAll({})
    console.log('🔍 All users in database:', allUsers)
    console.log('🔍 Number of users:', allUsers?.length || 0)
    
    if (allUsers && allUsers.length > 0) {
      allUsers.forEach((user, index) => {
        console.log(`🔍 User ${index + 1}:`, {
          _id: user._id,
          _id_type: typeof user._id,
          email: user.email,
          created_at: user.created_at
        })
      })
    }
    
    res.json({
      totalUsers: allUsers?.length || 0,
      users: allUsers?.map(u => ({
        _id: u._id,
        _id_type: typeof u._id,
        email: u.email
      })) || []
    })
    
  } catch (error) {
    console.log('❌ Database debug error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Test user lookup with different ID formats
API.get('/debug/lookup/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('🔍 Testing user lookup with ID:', id, typeof id)
    
    // Try string lookup
    console.log('🔍 Trying string lookup...')
    const stringResult = await API.DB.Users.read({ where: { _id: id } })
    console.log('🔍 String lookup result:', stringResult ? stringResult.email : 'NOT FOUND')
    
    // Try ObjectId lookup  
    console.log('🔍 Trying ObjectId lookup...')
    let objectIdResult = null
    try {
      const objectId = new ObjectId(id)
      objectIdResult = await API.DB.Users.read({ where: { _id: objectId } })
      console.log('🔍 ObjectId lookup result:', objectIdResult ? objectIdResult.email : 'NOT FOUND')
    } catch (e) {
      console.log('🔍 ObjectId conversion failed:', e.message)
    }
    
    res.json({
      id: id,
      stringLookup: stringResult ? stringResult.email : 'NOT FOUND',
      objectIdLookup: objectIdResult ? objectIdResult.email : 'NOT FOUND'
    })
    
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

API.listen(4008, () => {
  console.log(`
🔍 Database Debug Server running on port 4008!

Debug endpoints:
1. GET http://localhost:4008/debug/database - Show all users in DB
2. GET http://localhost:4008/debug/lookup/:id - Test user lookup by ID

Test sequence:
1. Register: curl -X POST http://localhost:4008/register -H "Content-Type: application/json" -d '{"email":"dbtest@example.com","password":"password123"}'
2. Check DB: curl http://localhost:4008/debug/database
3. Test lookup: curl http://localhost:4008/debug/lookup/USER_ID_FROM_STEP_2
`)
})