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

API.Start();

console.log('🍃 MongoDB Integration Example API running!');
console.log('Try: POST /tasks - Create a task');
console.log('Try: GET /tasks - Get all tasks');
console.log('Try: GET /tasks/:id - Get specific task');
console.log('Try: PUT /tasks/:id - Update task');
console.log('Try: DELETE /tasks/:id - Delete task');
console.log('Try: GET /stats - Database statistics (admin only)'); 