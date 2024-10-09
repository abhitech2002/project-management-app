# Project Management App

This is a Node.js-based project management app that allows users to create and manage projects, invite collaborators, and manage tasks.

## Features
- User registration and login with JWT authentication
- Project creation with collaborator invitation
- Task management (create, edit, delete) for project owners and collaborators
- Automatic marking of tasks as expired when the due date passes
- 24-hour block for users after 5 failed login attempts

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/project-management-app.git
   cd project-management-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and add the following variables:
   ```
   MONGO_URI=mongodb+srv://your-db-url
   JWT_SECRET=your_jwt_secret
   ```

4. Run the application:
   ```bash
   npm start
   ```

5. Access the app at `http://localhost:5000`.

