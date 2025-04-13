# Taskmate

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

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.