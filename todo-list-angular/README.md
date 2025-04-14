# TaskMate - Task Management Application

## Overview

TaskMate is a comprehensive task management application built with Angular and Python Flask. It provides users with a powerful platform to manage their tasks, track progress, and collaborate with team members.

## Features

### User Features

- **Authentication System**

  - Secure login and registration
  - Email verification
  - Password reset functionality
  - Session management

- **Task Management**

  - Create, read, update, and delete tasks
  - Task categorization
  - Priority levels
  - Due date tracking
  - Task status updates

- **Dashboard**
  - Task overview
  - Progress tracking
  - Analytics and insights
  - Quick actions

### Admin Features

- **User Management**

  - User list and details
  - User status management
  - Role assignment

- **Task Administration**
  - Create tasks for users
  - Monitor task progress
  - Task analytics
  - Bulk operations

## Technical Stack

### Frontend (Angular)

- Angular 16
- TypeScript
- Angular Material
- RxJS
- Google Analytics Integration

### Backend (Python Flask)

- Python 3.x
- Flask
- SQLAlchemy
- JWT Authentication
- RESTful API

## Project Structure

### Frontend Structure

```
todo-list-angular/
├── src/
│   ├── app/
│   │   ├── admin/           # Admin components
│   │   ├── auth/            # Authentication components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── services/        # Angular services
│   │   ├── shared/          # Shared components
│   │   └── landing-page/    # Landing page
│   ├── assets/              # Static assets
│   └── environments/        # Environment configurations
```

### Backend Structure

```
backend/
├── app.py                   # Main application file
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables
```

## Setup and Installation

### Frontend Setup

1. Install Node.js and npm
2. Clone the repository
3. Install dependencies:
   ```bash
   cd todo-list-angular
   npm install
   ```
4. Start the development server:
   ```bash
   ng serve
   ```

### Backend Setup

1. Install Python 3.x
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   python app.py
   ```

## Environment Configuration

### Frontend (.env)

```
API_URL=http://localhost:5000
GA_TRACKING_ID=your-ga-id
```

### Backend (.env)

```
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
```

## API Documentation

### Authentication Endpoints

- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- POST /api/auth/reset-password - Password reset

### Task Endpoints

- GET /api/tasks - Get all tasks
- POST /api/tasks - Create a task
- GET /api/tasks/:id - Get task details
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

### Admin Endpoints

- GET /api/admin/users - Get all users
- GET /api/admin/tasks - Get all tasks
- POST /api/admin/tasks - Create task for user
- PUT /api/admin/tasks/:id - Update task
- DELETE /api/admin/tasks/:id - Delete task

## Security Features

- JWT-based authentication
- Password hashing
- CSRF protection
- Input validation
- Rate limiting
- Secure headers

## Analytics Integration

- Google Analytics tracking
- User behavior monitoring
- Performance metrics
- Error tracking

## Deployment

The application can be deployed using:

- Frontend: Vercel, Netlify, or any static hosting
- Backend: Heroku, Render, or any Python hosting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
