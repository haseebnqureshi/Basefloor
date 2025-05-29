# API Explorer

The API Explorer allows you to test Basefloor API endpoints directly in the documentation. Make real HTTP requests, test authentication, and see live responses without leaving your browser.

## Basic Usage

### Creating a User

Test user creation with this example:

<APIExplorer 
  method="POST" 
  endpoint="/users" 
  :requiresAuth="false"
  sampleBody='{"email": "user@example.com", "password": "securePassword123"}'
/>

### Reading User Data

Test fetching user data (requires authentication):

<APIExplorer 
  method="GET" 
  endpoint="/users/:id" 
  :requiresAuth="true"
/>

### Listing All Users

Test listing users with query parameters:

<APIExplorer 
  method="GET" 
  endpoint="/users" 
  :requiresAuth="false"
/>

## How to Use

### 1. Configure the Request
- **Base URL**: Configure to match your server (e.g., `https://api.yourdomain.com` for production or `http://localhost:3000` for development)
- **Method**: Choose GET, POST, PUT, PATCH, or DELETE
- **Endpoint**: The API path (path parameters like `:id` are automatically detected)

### 2. Set Parameters
- **Path Parameters**: Fill in values for URL parameters (e.g., `:id` becomes a text input)
- **Query Parameters**: Add URL query parameters using the "+" button
- **Headers**: Add custom headers for your request

### 3. Configure Authentication
- **None**: No authentication required
- **Bearer Token**: JWT token authentication
- **Basic Auth**: Username/password authentication

### 4. Add Request Body
For POST, PUT, and PATCH requests:
- **JSON**: Structured data (most common)
- **Form Data**: Key-value pairs
- **Raw Text**: Plain text or custom formats

### 5. Send & Analyze
- Click "Send Request" to make the API call
- View the response data, status code, and headers
- Check response time and debug any errors

## Authentication Guide

### Getting a JWT Token

1. First, create a user account (if you don't have one)
2. Use the login endpoint to get a token:

<APIExplorer 
  method="POST" 
  endpoint="/auth/login" 
  :requiresAuth="false"
  sampleBody='{"email": "user@example.com", "password": "securePassword123"}'
/>

3. Copy the token from the response
4. Use it in the "Bearer Token" field for authenticated requests

### Using Authentication

For endpoints that require authentication:
- Select "Bearer Token" in the Auth Type dropdown
- Paste your JWT token in the Token field
- The Authorization header will be automatically added

## Common Use Cases

### Testing CRUD Operations

**Create** → **Read** → **Update** → **Delete** workflow:

1. **POST** `/users` - Create a new user
2. **GET** `/users/:id` - Fetch the created user
3. **PUT** `/users/:id` - Update user information
4. **DELETE** `/users/:id` - Remove the user

### File Upload Testing

For file upload endpoints:
1. Select "Form Data" as the body type
2. Add a "file" field
3. Choose a file from your computer
4. Add any additional metadata fields

### Query Parameter Testing

Test filtering and pagination:
- Add `limit` and `offset` for pagination
- Add filter parameters like `status=active`
- Test sorting with `sort=createdAt` or `sort=-name`

## Troubleshooting

### Common Issues

**Connection Refused**
- Make sure your Basefloor server is running and accessible
- **Development**: Check `http://localhost:3000` (or your configured port)
- **Production**: Verify your domain and SSL configuration

**401 Unauthorized**
- Verify your JWT token is valid and not expired
- Make sure you're using the correct authentication method

**404 Not Found**
- Check that the endpoint exists in your Basefloor configuration
- Verify the HTTP method is correct (GET vs POST, etc.)

**CORS Errors**
- Add your documentation URL to the CORS origins in your Basefloor config
- Make sure CORS is properly configured for your environment

### Server Setup

Make sure your Basefloor server is running:

**Development:**
```bash
# Start your Basefloor server
node index.js

# Or if using npm scripts
npm run dev
```

**Production:**
- Ensure your server is deployed and accessible at your domain
- Verify SSL certificates are properly configured
- Check that your domain DNS is pointing to your server

## Environment Configuration

### Development Setup
- **Base URL**: `http://localhost:3000` (or your configured port)
- **CORS**: Allow `http://localhost:5173` (or your docs port)
- **SSL**: Not required for local development

### Production Setup
- **Base URL**: `https://api.yourdomain.com`
- **CORS**: Allow your documentation domain
- **SSL**: Required for production APIs

## Advanced Features

### Custom Headers

Add custom headers for:
- API versioning (`Accept: application/vnd.api+json;version=1`)
- Content negotiation (`Accept: application/xml`)
- Custom authentication schemes
- Request tracking (`X-Request-ID: unique-id`)

### Response Analysis

The API Explorer shows:
- **Status Code**: HTTP response status with color coding
- **Response Time**: How long the request took
- **Headers**: All response headers
- **Body**: Formatted response data (JSON, XML, etc.)

### Request History

- Previous requests are saved in your browser session
- Quickly retry or modify previous requests
- Copy successful requests as code examples

## Next Steps

After testing your APIs:

1. **Copy working requests** as code examples for your application
2. **Document your findings** in your project's API documentation
3. **Build your frontend** using the tested endpoints
4. **Set up automated tests** based on your manual testing

## Integration with Other Tools

- **Configuration Builder**: Test APIs you've built with the config builder
- **Code Playground**: Copy working requests as code examples
- **Examples**: Reference real-world usage patterns

---

*The API Explorer makes real HTTP requests to your server. Configure the base URL to match your environment (development or production).* 