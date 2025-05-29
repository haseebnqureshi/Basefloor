# Configuration Builder

The Configuration Builder is a visual interface for creating Basefloor configuration files. Build your configuration step-by-step with real-time validation and export functionality.

<ConfigBuilder />

## How to Use

### 1. Basic Settings
Start by configuring your basic server settings:
- **Port**: The port your server will run on (default: 3000)
- **Database URI**: Your MongoDB connection string
- **JWT Secret**: Secret key for JWT token signing
- **CORS Origins**: Allowed origins for cross-origin requests

### 2. Define Models
Create your data models by:
- Clicking "Add Model" to create a new model
- Adding fields with appropriate types (String, Number, Boolean, Date, ObjectId, Array, Object)
- Marking fields as required when necessary
- Removing fields or models as needed

### 3. Configure Routes
Set up your API routes by:
- Clicking "Add Route" to create a new endpoint
- Selecting the model this route will operate on
- Choosing which CRUD operations to enable:
  - **C** (Create): POST requests to create new records
  - **rA** (Read All): GET requests to list all records
  - **r** (Read): GET requests to fetch a single record
  - **u** (Update): PUT/PATCH requests to modify records
  - **d** (Delete): DELETE requests to remove records

### 4. Preview & Export
- Switch to the "Preview" tab to see your generated configuration
- Click "Copy" to copy the configuration to your clipboard
- Click "Export Config" to download as a JSON file
- Use "Reset" to start over with a clean slate

## Tips for Success

### Model Design
- Use descriptive field names that match your business logic
- Consider which fields should be required vs optional
- Use appropriate data types for validation and performance

### Route Configuration
- Start with basic CRUD operations and add complexity later
- Consider which operations your API actually needs
- Remember that you can always modify the exported configuration

### Best Practices
- Use environment variables for sensitive data (JWT secrets, database URIs)
- Keep model names singular and PascalCase (e.g., "User", "BlogPost")
- Use kebab-case for route paths (e.g., "/blog-posts")
- Configure CORS origins for your actual domains (e.g., "https://yourdomain.com")

## Example Configurations

### Simple Blog API
A basic blog with users and posts:
- **Models**: User (email, password), Post (title, content, author)
- **Routes**: /users (full CRUD), /posts (full CRUD with author linking)

### E-commerce API
Product catalog with categories:
- **Models**: Category (name, description), Product (name, price, category)
- **Routes**: /categories (read-only), /products (full CRUD)

### File Management API
Document storage system:
- **Models**: User (email, role), File (name, path, owner, permissions)
- **Routes**: /users (admin only), /files (owner-based permissions)

## Environment Configuration

The generated configuration should be customized for your environment:

### Development
```javascript
module.exports = {
  port: 3000,
  database: {
    uri: 'mongodb://localhost:27017/myapp-dev'
  },
  jwt: {
    secret: 'dev-secret-key'
  },
  cors: {
    origins: ['http://localhost:3000', 'http://localhost:5173']
  },
  // ... your models and routes
};
```

### Production
```javascript
module.exports = {
  port: process.env.PORT || 3000,
  database: {
    uri: process.env.MONGODB_URI
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d'
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['https://yourdomain.com']
  },
  // ... your models and routes
};
```

## Next Steps

After building your configuration:

1. **Save the file** as `basefloor.config.js` in your project root
2. **Replace placeholder values** like `yourdomain.com` with your actual domain
3. **Set up environment variables** for sensitive data (JWT secrets, database URIs)
4. **Install Basefloor** if you haven't already: `npm install basefloor`
5. **Start your server** with: `node index.js` (using the generated config)
6. **Test your API** using the [API Explorer](/tools/api-explorer)

## Need More Control?

The Configuration Builder covers the most common use cases, but Basefloor supports many advanced features:

- Custom middleware and hooks
- Advanced permission systems
- File upload handling
- Email integration
- AI services

Check out the [Reference Guide](/reference/) for complete documentation on all available options. 