<!-- # Taskmate

## Overview
Taskmate is a full-stack application that consists of an Angular frontend and a Flask backend. This project allows users to manage tasks, including creating, updating, and deleting tasks, as well as user authentication and role-based access control.

## Table of Contents
- [Frontend (Angular)](#frontend-angular)
- [Backend (Flask)](#backend-flask)
- [Installation](#installation)
- [Usage](#usage)
- [Running Tests](#running-tests)
- [Contributing](#contributing)
- [License](#license)

## Frontend (Angular)
The frontend is built using Angular and provides a user-friendly interface for task management.

### Features
- User authentication (registration and login)
- Task creation, updating, and deletion
- Role-based access control (admin and user roles)
- Task filtering and statistics display

### Installation
1. Navigate to the `todo-list-angular` directory.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application
To run the Angular application, use the following command:
```bash
ng serve
```
The application will be available at `http://localhost:4200`.

## Backend (Flask)
The backend is built using Flask and provides a RESTful API for task management.

### Features
- User authentication with JWT
- CRUD operations for tasks
- Role-based access control for admin and user roles
- Task statistics and analytics

### Installation
1. Navigate to the `backend` directory.
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
4. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application
To run the Flask application, use the following command:
```bash
python app.py
```
The API will be available at `http://localhost:5000`.

<!-- ## Running Tests
### Frontend Tests
To run unit tests for the Angular application, use:
```bash
ng test
```

### Backend Tests
To run tests for the Flask application, you can use a testing framework like `pytest`. Ensure you have it installed and run:
```bash
pytest
``` -->

<!-- ## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. --> -->

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

### Frontend (environment.ts)

```
apiUrl:=http://localhost:5000

```

### Backend (.env)

```
SECRET_KEY=your-secret-key
MONGODB_URI=mongo-uri
```

## API Documentation

### Authentication Endpoints

- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout

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

- Frontend: Vercel
- Backend:  Render

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
