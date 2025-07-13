# Express-First Todo API

This example demonstrates the new Express-first approach to Basefloor development. Instead of learning a complex DSL, you use familiar Express patterns while leveraging Basefloor's powerful features.

## ✨ What's Different

### Before (Complex DSL)
```javascript
routes: () => ({
  "/todos(Todos)": {
    c: { allow: "@req_user._id", inject: { userId: "@req_user._id" }},
    rA: { allow: "@req_user._id" },
    r: { allow: "@req_user._id" },
    u: { allow: "@_todos.userId=@req_user._id" },
    d: { allow: "@_todos.userId=@req_user._id" }
  }
})
```

### After (Familiar Express)
```javascript
const { auth, models } = API.createMiddleware()

app.post('/todos', 
  auth.required,           // Basefloor auth
  models.Todos.validate,   // Basefloor validation
  async (req, res) => { /* Standard Express */ }
)
```

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## 📝 API Endpoints

### Authentication
- `POST /register` - Create new user account
- `POST /login` - Get JWT token
- `GET /user` - Get current user info

### Todos (all require authentication)
- `POST /todos` - Create new todo
- `GET /todos` - List user's todos
- `GET /todos/:id` - Get specific todo
- `PUT /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo
- `POST /todos/bulk` - Create multiple todos
- `GET /stats` - Get user's todo statistics

## 🔍 Example Usage

1. **Register a user**
   ```bash
   curl -X POST http://localhost:3000/register \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password123"}'
   ```

2. **Login to get token**
   ```bash
   curl -X POST http://localhost:3000/login \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password123"}'
   ```

3. **Create a todo** (use token from login)
   ```bash
   curl -X POST http://localhost:3000/todos \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{"title": "Learn Basefloor Express patterns"}'
   ```

4. **Get your todos**
   ```bash
   curl -X GET http://localhost:3000/todos \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## 💡 Key Benefits

### For Developers
- **Familiar Express patterns** - no new syntax to learn
- **Working in 5 minutes** instead of 3+ hours
- **Clear error messages** with helpful context
- **Easy to extend** with custom middleware

### For Basefloor
- **Preserve powerful features** - auth, validation, permissions
- **Better developer experience** - lower barrier to entry
- **Standard patterns** - easier to debug and maintain

## 🛠 Architecture

This example shows how Basefloor's existing functionality is exposed through Express middleware:

```javascript
// Extract existing functionality as middleware
const { auth, models, permissions } = API.createMiddleware()

// Use in standard Express patterns
app.post('/todos',
  auth.required,        // JWT validation (existing)
  models.Todos.validate, // Schema validation (existing) 
  async (req, res) => {
    // Your business logic
  }
)
```

## 🔄 Migration from DSL

If you have existing DSL routes, you can gradually migrate:

1. **Keep existing DSL routes working** (100% backward compatible)
2. **Add new routes using Express patterns**
3. **Migrate existing routes one by one** when convenient

## 📚 Next Steps

- **Week 2**: Enhanced permissions with readable syntax
- **Week 3**: Better error messages and CLI tools
- **Week 4**: Project generator (`npx create-basefloor-app`)

This is just the beginning - all of Basefloor's power with Express simplicity!