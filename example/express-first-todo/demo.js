/**
 * Quick demo of the Express-first todo API
 * This shows the dramatic improvement in developer experience
 */

const axios = require('axios')

const API_URL = 'http://localhost:4001'
let authToken = ''

const test = async () => {
  try {
    console.log('🚀 Testing Express-First Todo API')
    console.log('=====================================\n')

    // 1. Register a user
    console.log('📝 Registering user...')
    const registerResponse = await axios.post(`${API_URL}/register`, {
      email: 'demo@example.com',
      password: 'password123'
    })
    console.log('✅ User registered:', registerResponse.data.message)

    // 2. Login to get token
    console.log('\n🔐 Logging in...')
    const loginResponse = await axios.post(`${API_URL}/login`, {
      email: 'demo@example.com', 
      password: 'password123'
    })
    authToken = loginResponse.data.token
    console.log('✅ Login successful, got token')

    // Setup headers for authenticated requests
    const authHeaders = {
      headers: { Authorization: `Bearer ${authToken}` }
    }

    // 3. Create some todos
    console.log('\n📋 Creating todos...')
    const todo1 = await axios.post(`${API_URL}/todos`, {
      title: 'Learn Express-first Basefloor'
    }, authHeaders)
    console.log('✅ Todo 1 created:', todo1.data.title)

    const todo2 = await axios.post(`${API_URL}/todos`, {
      title: 'Write API documentation'
    }, authHeaders)
    console.log('✅ Todo 2 created:', todo2.data.title)

    // 4. Get all todos
    console.log('\n📖 Getting all todos...')
    const todosResponse = await axios.get(`${API_URL}/todos`, authHeaders)
    console.log(`✅ Retrieved ${todosResponse.data.length} todos`)
    todosResponse.data.forEach((todo, i) => {
      console.log(`   ${i + 1}. ${todo.title} (${todo.completed ? '✓' : '○'})`)
    })

    // 5. Update a todo
    console.log('\n✏️  Updating todo...')
    const firstTodoId = todosResponse.data[0]._id
    await axios.put(`${API_URL}/todos/${firstTodoId}`, {
      title: 'Learn Express-first Basefloor',
      completed: true
    }, authHeaders)
    console.log('✅ Todo marked as completed')

    // 6. Get stats
    console.log('\n📊 Getting stats...')
    const statsResponse = await axios.get(`${API_URL}/stats`, authHeaders)
    console.log('✅ Stats:', statsResponse.data)

    // 7. Create bulk todos
    console.log('\n📦 Creating bulk todos...')
    await axios.post(`${API_URL}/todos/bulk`, {
      todos: [
        { title: 'Test bulk creation' },
        { title: 'Celebrate success' }
      ]
    }, authHeaders)
    console.log('✅ Bulk todos created')

    // 8. Final todo list
    console.log('\n📋 Final todo list:')
    const finalTodos = await axios.get(`${API_URL}/todos`, authHeaders)
    finalTodos.data.forEach((todo, i) => {
      console.log(`   ${i + 1}. ${todo.title} (${todo.completed ? '✓' : '○'})`)
    })

    console.log('\n🎉 Demo completed successfully!')
    console.log('\n💡 Key benefits demonstrated:')
    console.log('   • Familiar Express patterns')
    console.log('   • Working authentication')
    console.log('   • User-scoped data')
    console.log('   • Custom middleware support')
    console.log('   • Standard REST endpoints')

  } catch (error) {
    console.error('❌ Demo failed:', error.response?.data || error.message)
  }
}

// Wait a moment for server to start, then run demo
setTimeout(test, 2000)