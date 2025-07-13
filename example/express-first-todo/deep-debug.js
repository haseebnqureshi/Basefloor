/**
 * Deep debug the database read method to find the real issue
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

// Deep debug endpoint
API.get('/debug/deep/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('\n🔍 DEEP DEBUG: User lookup')
    console.log('🔍 Target ID:', id)
    
    // First, get all users to see what we're working with
    const allUsers = await API.DB.Users.readAll({})
    console.log('🔍 All users:', allUsers)
    
    if (allUsers && allUsers.length > 0) {
      const firstUser = allUsers[0]
      console.log('🔍 First user _id:', firstUser._id)
      console.log('🔍 First user _id type:', typeof firstUser._id)
      console.log('🔍 First user _id constructor:', firstUser._id.constructor.name)
      console.log('🔍 First user _id toString():', firstUser._id.toString())
      
      // Try different comparison methods
      console.log('\n🔍 Testing ID comparisons:')
      console.log('🔍 firstUser._id === id (string):', firstUser._id === id)
      console.log('🔍 firstUser._id.toString() === id:', firstUser._id.toString() === id)
      
      try {
        const objectId = new ObjectId(id)
        console.log('🔍 firstUser._id.equals(objectId):', firstUser._id.equals ? firstUser._id.equals(objectId) : 'no equals method')
        console.log('🔍 firstUser._id === objectId:', firstUser._id === objectId)
      } catch (e) {
        console.log('🔍 ObjectId conversion failed:', e.message)
      }
      
      // Try manual lookup with different where clauses
      console.log('\n🔍 Testing different where clauses:')
      
      // Try with string ID
      console.log('🔍 Testing where: { _id: "' + id + '" }')
      const result1 = await API.DB.Users.read({ where: { _id: id } })
      console.log('🔍 Result 1:', result1 ? result1.email : 'NOT FOUND')
      
      // Try with ObjectId
      try {
        const objectId = new ObjectId(id)
        console.log('🔍 Testing where: { _id: ObjectId("' + id + '") }')
        const result2 = await API.DB.Users.read({ where: { _id: objectId } })
        console.log('🔍 Result 2:', result2 ? result2.email : 'NOT FOUND')
      } catch (e) {
        console.log('🔍 ObjectId test failed:', e.message)
      }
      
      // Try with email lookup to see if the method works at all
      console.log('🔍 Testing where: { email: "' + firstUser.email + '" }')
      const result3 = await API.DB.Users.read({ where: { email: firstUser.email } })
      console.log('🔍 Result 3 (email lookup):', result3 ? result3.email : 'NOT FOUND')
      
      res.json({
        targetId: id,
        userExists: true,
        userStoredId: firstUser._id.toString(),
        userStoredIdType: typeof firstUser._id,
        stringComparison: firstUser._id.toString() === id,
        stringLookupWorks: !!result1,
        objectIdLookupWorks: !!result2,
        emailLookupWorks: !!result3
      })
    } else {
      res.json({ error: 'No users in database' })
    }
    
  } catch (error) {
    console.log('❌ Deep debug error:', error)
    res.status(500).json({ error: error.message, stack: error.stack })
  }
})

API.listen(4009, () => {
  console.log(`
🔍 Deep Debug Server running on port 4009!

Test sequence:
1. Register: curl -X POST http://localhost:4009/register -H "Content-Type: application/json" -d '{"email":"deeptest@example.com","password":"password123"}'
2. Deep debug: curl http://localhost:4009/debug/deep/USER_ID
`)
})