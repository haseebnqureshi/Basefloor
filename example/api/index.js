/**
 * Basefloor Example API
 */
require('dotenv').config();

// Import the Basefloor API
const BasefloorAPI = require('../../packages/api');

// Initialize the API with the project path
const API = BasefloorAPI({
  projectPath: __dirname,
  envPath: './.env' // Path to your .env file
});

// Custom route to get tasks for current user
API.route('/my-tasks', {
  method: 'get',
  auth: true,
  handler: async (req, res) => {
    try {
      const tasks = await API.DB.Tasks.readAll({ where: { user_id: req.user._id } });
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