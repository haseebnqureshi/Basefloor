/**
 * Feature 3: MongoDB Integration
 * Seamless MongoDB integration with built-in CRUD operations and data modeling
 */
require('dotenv').config();
const api = require('../../packages/api');

const API = api({
  projectPath: __dirname,
  envPath: './.env'
});

// Initialize the API first to make middlewares available
API.Init();

// Create a new task
API.post('/tasks', [API.requireAuthentication], async (req, res) => {
  try {
    const task = await API.DB.Tasks.create({
      title: req.body.title,
      description: req.body.description,
      completed: false,
      user_id: req.user._id
    });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tasks for current user
API.get('/tasks', [API.requireAuthentication], async (req, res) => {
  try {
    const tasks = await API.DB.Tasks.readAll({ 
      where: { user_id: req.user._id },
      sort: { created_at: -1 }
    });
    res.json({ success: true, data: tasks, count: tasks.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific task
API.get('/tasks/:id', [API.requireAuthentication], async (req, res) => {
  try {
    const task = await API.DB.Tasks.read({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a task
API.put('/tasks/:id', [API.requireAuthentication], async (req, res) => {
  try {
    const task = await API.DB.Tasks.update(
      { where: { _id: req.params.id, user_id: req.user._id } },
      { 
        title: req.body.title,
        description: req.body.description,
        completed: req.body.completed
      }
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a task
API.delete('/tasks/:id', [API.requireAuthentication], async (req, res) => {
  try {
    const result = await API.DB.Tasks.delete({ 
      where: { _id: req.params.id, user_id: req.user._id }
    });
    if (!result) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get database stats (simplified - just requires authentication)
API.get('/stats', [API.requireAuthentication], async (req, res) => {
  try {
    const userCount = await API.DB.Users.count();
    const taskCount = await API.DB.Tasks.count();
    
    res.json({
      success: true,
      stats: {
        users: userCount,
        tasks: taskCount,
        database: 'MongoDB',
        connection: API.DB.connection.readyState === 1 ? 'Connected' : 'Disconnected'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test routes without authentication for MongoDB testing
API.post('/test/tasks', async (req, res) => {
  try {
    const task = await API.DB.Tasks.create({
      title: req.body.title,
      description: req.body.description,
      completed: req.body.completed || false,
      user_id: 'test-user-id' // Use fixed test user ID
    });
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.get('/test/tasks', async (req, res) => {
  try {
    const tasks = await API.DB.Tasks.readAll({ 
      where: { user_id: 'test-user-id' },
      sort: { created_at: -1 }
    });
    res.json({ success: true, data: tasks, count: tasks.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.get('/test/tasks/:id', async (req, res) => {
  try {
    const task = await API.DB.Tasks.read({ 
      where: { _id: req.params.id }
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.put('/test/tasks/:id', async (req, res) => {
  try {
    const task = await API.DB.Tasks.update(
      { where: { _id: req.params.id } },
      { 
        title: req.body.title,
        description: req.body.description,
        completed: req.body.completed
      }
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.delete('/test/tasks/:id', async (req, res) => {
  try {
    const result = await API.DB.Tasks.delete({ 
      where: { _id: req.params.id }
    });
    if (!result) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.get('/test/stats', async (req, res) => {
  try {
    const taskCount = await API.DB.Tasks.count({ user_id: 'test-user-id' });
    
    res.json({
      success: true,
      stats: {
        test_tasks: taskCount,
        database: 'MongoDB',
        connection: API.DB.connection ? (API.DB.connection.readyState === 1 ? 'Connected' : 'Disconnected') : 'Unknown'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

API.Start();

console.log('🍃 MongoDB Integration Example API running!');
console.log('🧪 Testing MongoDB CRUD operations...\n');

// Wait for server to start, then test MongoDB operations
setTimeout(async () => {
  const baseUrl = `http://localhost:${API.port || 4000}`;
  const axios = require('axios');
  let createdTaskId = null;
  
  try {
    console.log('1. Testing database connection...');
    const statsResponse = await axios.get(`${baseUrl}/test/stats`);
    console.log('✓ Database connection:', statsResponse.data.stats.connection);
    console.log('✓ Initial test tasks count:', statsResponse.data.stats.test_tasks);
    
    console.log('\n2. Testing CREATE operation...');
    const createResponse = await axios.post(`${baseUrl}/test/tasks`, {
      title: 'Test Task from MongoDB Integration',
      description: 'This task was created to test MongoDB CRUD operations',
      completed: false
    });
    createdTaskId = createResponse.data.data._id;
    console.log('✓ Task created successfully');
    console.log('  - ID:', createdTaskId);
    console.log('  - Title:', createResponse.data.data.title);
    console.log('  - Completed:', createResponse.data.data.completed);
    
    console.log('\n3. Testing READ operation (single task)...');
    const readResponse = await axios.get(`${baseUrl}/test/tasks/${createdTaskId}`);
    console.log('✓ Task retrieved successfully');
    console.log('  - Title:', readResponse.data.data.title);
    console.log('  - Description:', readResponse.data.data.description);
    
    console.log('\n4. Testing UPDATE operation...');
    const updateResponse = await axios.put(`${baseUrl}/test/tasks/${createdTaskId}`, {
      title: 'Updated Test Task',
      description: 'This task was updated to test MongoDB UPDATE operation',
      completed: true
    });
    console.log('✓ Task updated successfully');
    console.log('  - New title:', updateResponse.data.data.title);
    console.log('  - Completed status:', updateResponse.data.data.completed);
    
    console.log('\n5. Testing READ ALL operation...');
    const readAllResponse = await axios.get(`${baseUrl}/test/tasks`);
    console.log('✓ Tasks list retrieved successfully');
    console.log('  - Total tasks:', readAllResponse.data.count);
    console.log('  - Sample task:', readAllResponse.data.data[0]?.title || 'No tasks');
    
    console.log('\n6. Testing DELETE operation...');
    const deleteResponse = await axios.delete(`${baseUrl}/test/tasks/${createdTaskId}`);
    console.log('✓ Task deleted successfully');
    console.log('  - Message:', deleteResponse.data.message);
    
    console.log('\n7. Verifying deletion...');
    try {
      await axios.get(`${baseUrl}/test/tasks/${createdTaskId}`);
      console.log('❌ Task still exists after deletion');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✓ Task properly deleted (404 not found)');
      } else {
        console.log('⚠️  Unexpected error verifying deletion:', error.response?.status);
      }
    }
    
    console.log('\n8. Final database stats...');
    const finalStatsResponse = await axios.get(`${baseUrl}/test/stats`);
    console.log('✓ Final test tasks count:', finalStatsResponse.data.stats.test_tasks);
    
    console.log('\n🎉 MongoDB CRUD operations completed successfully!');
    console.log('\nFeatures demonstrated:');
    console.log('✓ Database connection');
    console.log('✓ CREATE - Adding new documents');
    console.log('✓ READ - Retrieving single document');
    console.log('✓ READ ALL - Querying multiple documents');
    console.log('✓ UPDATE - Modifying existing documents');
    console.log('✓ DELETE - Removing documents');
    console.log('✓ COUNT - Aggregation operations');
    console.log('✓ Error handling for not found');
    
    console.log('\n📋 Production endpoints (with authentication):');
    console.log('  POST /tasks - Create task (requires auth)');
    console.log('  GET /tasks - List tasks (requires auth)');  
    console.log('  GET /tasks/:id - Get specific task (requires auth)');
    console.log('  PUT /tasks/:id - Update task (requires auth)');
    console.log('  DELETE /tasks/:id - Delete task (requires auth)');
    console.log('  GET /stats - Database statistics (requires auth)');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}, 2000); 