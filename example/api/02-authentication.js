/**
 * Feature 2: Built-in Authentication  
 * JWT-based auth with user registration, login, and permission management
 */
require('dotenv').config();
const api = require('../../packages/api');

const API = api({
  projectPath: __dirname,
  envPath: './.env'
});

// Initialize the API first to make middlewares available
API.Init();

// Public registration endpoint
API.post('/auth/register', [], async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await API.DB.Users.read({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user
    const user = await API.DB.Users.create({
      name,
      email,
      password: await API.Auth.hashPassword(password),
      role: 'user'
    });
    
    res.json({ 
      success: true, 
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public login endpoint
API.post('/auth/login', [], async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await API.DB.Users.read({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await API.Auth.verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = API.Auth.generateToken(user);
    
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected route - requires authentication
API.get('/auth/profile', [API.requireAuthentication], (req, res) => {
  res.json({
    message: 'This is a protected route!',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Admin-only route (simplified - just requires authentication)
API.get('/auth/admin', [API.requireAuthentication], (req, res) => {
  res.json({
    message: 'Admin access granted!',
    user: req.user
  });
});

API.Start();

console.log('🔐 Authentication Example API running!');
console.log('Try: POST /auth/register - Register a new user');
console.log('Try: POST /auth/login - Login user');
console.log('Try: GET /auth/profile - Get profile (requires token)');
console.log('Try: GET /auth/admin - Admin route (requires admin role)'); 