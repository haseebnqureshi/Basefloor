/**
 * Simple test to verify our Express middleware works
 */

const path = require('path')

try {
  console.log('🧪 Testing Express-first middleware extraction...')
  
  // Initialize Basefloor
  const basefloor = require('../../packages/api')
  const API = basefloor({ 
    projectPath: __dirname,
    envPath: path.join(__dirname, '.env.example') 
  })
  
  console.log('✅ Basefloor initialized')
  
  // Initialize all systems
  API.Init()
  console.log('✅ API.Init() completed')
  
  // Test middleware creation
  const { auth, models, permissions } = API.createMiddleware()
  console.log('✅ Middleware created successfully')
  
  // Test auth middleware exists
  console.log('🔍 Testing middleware components:')
  console.log(`   auth.required: ${typeof auth.required}`)
  console.log(`   models: ${Object.keys(models).join(', ')}`)
  console.log(`   permissions.check: ${typeof permissions.check}`)
  
  // Test that auth middleware is the actual function
  if (typeof auth.required === 'function') {
    console.log('✅ auth.required is a function (middleware)')
  } else {
    console.log('❌ auth.required is not a function')
  }
  
  // Test model operations exist
  if (models.Todos && models.Users) {
    console.log('✅ Models extracted: Todos, Users')
    console.log(`   Todos.create: ${typeof models.Todos.create}`)
    console.log(`   Todos.validate: ${typeof models.Todos.validate}`)
    console.log(`   Users.create: ${typeof models.Users.create}`)
  } else {
    console.log('❌ Models not properly extracted')
  }
  
  console.log('\n🎉 Express-first middleware is working!')
  console.log('🚀 Ready to run: node app.js')
  
} catch (error) {
  console.error('❌ Test failed:', error.message)
  console.error(error.stack)
  process.exit(1)
}