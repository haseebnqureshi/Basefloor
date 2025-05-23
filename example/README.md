# Basefloor Example

This is a complete example project showcasing how to use the Basefloor package to create a full-stack application.

## Features

- Complete task management application
- User authentication and authorization
- Beautiful UI using Basefloor components
- Backend API built with Basefloor API

## Structure

This example consists of two parts:

1. `/api` - The backend API server built with Basefloor API
2. `/app` - The frontend Nuxt.js application built with Basefloor components

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB (local or cloud instance)
- NPM or Yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/basefloor.git
cd basefloor/example
```

2. Install dependencies for both API and App:

```bash
# Install API dependencies
cd api
npm install

# Install App dependencies
cd ../app
npm install
```

3. Configure the API:

Copy the `.env-example` file to `.env` and update the values:

```bash
cd ../api
cp .env-example .env
# Edit the .env file with your MongoDB connection string and JWT secret
```

### Running the Example

1. Start the API server:

```bash
cd api
npm run dev
```

2. In another terminal, start the Nuxt app:

```bash
cd app
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:4000

## API Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login a user
- `GET /auth/me` - Get current user
- `GET /my-tasks` - Get tasks for the current user
- `GET /tasks/:id` - Get a specific task
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

## Frontend Pages

- `/` - Home page
- `/login` - Login page
- `/register` - Register page
- `/tasks` - Task list
- `/tasks/new` - Create a new task
- `/tasks/:id` - View task details
- `/tasks/:id/edit` - Edit a task
- `/profile` - User profile 