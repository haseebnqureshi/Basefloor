/**
 * Basefloor Example API
 */
require('dotenv').config();

// Import the Basefloor API
const { api } = require('basefloor');

// Initialize the API with the project path
const API = api({
  projectPath: __dirname,
  envPath: './.env' // Path to your .env file
});

// Define User model
API.model('User', {
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Define Task model
API.model('Task', {
  title: {
    type: String,
    required: true
  },
  description: String,
  completed: {
    type: Boolean,
    default: false
  },
  dueDate: Date,
  user: {
    type: API.types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Custom route to get tasks for current user
API.route('/my-tasks', {
  method: 'get',
  auth: true,
  handler: async (req, res) => {
    try {
      const tasks = await API.models.Task.find({ user: req.user._id });
      res.json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Initialize all components based on config
API.Init();

// Start the server
API.Start(); 