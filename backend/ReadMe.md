# Project Management Application

A project management application built using Node.js, Express, MongoDB, and Mongoose. This app allows project owners and collaborators to create, update, delete, and manage tasks within projects. Collaborators can only manage tasks they created, while the project owner has full access.

## Features
- **User Authentication**: JWT-based authentication for secure user access.
- **Project Management**: Create, update, delete, and view details of projects.
- **Task Management**: Create, update, delete, and view tasks related to projects.
- **Collaborators**: Collaborators can be added to projects to allow team collaboration.
- **Access Control**: Owners and collaborators have different levels of access for tasks and projects.

## Technologies Used
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Async Handler and Custom Error Handling

## Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [Postman](https://www.postman.com/downloads/) or a similar API testing tool (optional)

## Getting Started

### Clone the repository
```bash
git clone https://github.com/your-username/project-management-app.git
cd project-management-app
```

### Install Dependencies
```bash
npm install
```

### Environment Variables
Create a `.env` file in the root directory and add the following:
```markdown
PORT = 8000
MONGODB_URI = mongodb://localhost:27017/project-management
CORS_ORIGIN = *
ACCESS_TOKEN_SECRET = Your SECRET
ACCESS_TOKEN_EXPIRY = 1d
REFRESH_TOKEN_SECRET = Your SECRET
REFRESH_TOKEN_EXPIRY = 10d
```

### Run MongoDB
Make sure MongoDB is running on your local machine:
```bash
mongod
```

### Run the Server
```bash
npm start
```
The server will start on `http://localhost:8000`.

## API Endpoints

### User Authentication
- POST `/api/users/register`: Registers a new user.
- POST `/api/users/login`: Authenticates a user and returns a JWT token.

### Projects
- GET `/api/projects`: Get all projects for the logged-in user.
- POST `/api/projects`: Create a new project (logged-in user becomes the project owner).
- GET `/api/projects/:id`: Get project details by ID (owner or collaborator can view).
- PUT `/api/projects/:id`: Update a project (only project owner can update).
- DELETE `/api/projects/:id`: Delete a project (only project owner can delete).

### Tasks
- POST `/api/projects/:id/tasks`: Create a new task for the project (owner or collaborators can create tasks).
- GET `/api/projects/:id/tasks`: Get all tasks for a specific project.
- PUT `/api/projects/:id/tasks/:taskId`: Update a task (only task creator or project owner can update).
- DELETE `/api/projects/:id/tasks/:taskId`: Delete a task (only task creator or project owner can delete).

## Example Usage

### Register a User
```bash
POST /api/users/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

### Login a User
```bash
POST /api/users/login
{
  "email": "john@example.com",
  "password": "123456"
}
```
You will receive a JWT token. Use this token for subsequent requests by adding it to the Authorization header as a Bearer token.

### Create a Project
```bash
POST /api/projects
Authorization: Bearer <your_token>
{
  "name": "New Project",
  "description": "Project description",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Add a Collaborator
```bash
PUT /api/projects/:id/collaborators
Authorization: Bearer <your_token>
{
  "email": "collaborator@example.com"
}
```

### Create a Task
```bash
POST /api/projects/:id/tasks
Authorization: Bearer <your_token>
{
  "name": "Design UI",
  "startDate": "2024-10-01",
  "endDate": "2024-10-10",
  "priority": "high"
}
```

## Error Handling
The application uses custom error handling middleware to send consistent error responses.

Example Error Response
```json
{
  "status": 404,
  "message": "Project not found"
}
```

## License
This project is licensed under the MIT License - see the LICENSE file for details.