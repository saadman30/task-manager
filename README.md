# Task Management Application

A modern, full-stack task management application built with Laravel and React. This application allows users to efficiently manage their tasks with features like task creation, status updates, search, and filtering.

## Features

### User Management
- User authentication
- Secure login/logout functionality
- Token-based authentication using Laravel Sanctum

### Task Management
- Create new tasks with name, description, status, and due date
- List all tasks with sorting capabilities
- Update task details and status
- Delete tasks
- Search tasks by name or description
- Filter tasks by status (To Do, In Progress, Done)
- Task validation with proper error handling

## Tech Stack

### Backend
- **Framework**: Laravel 10.x
- **PHP Version**: 8.2+
- **Database**: MySQL 8.0
- **Web Server**: Nginx
- **Authentication**: Laravel Sanctum
- **Testing**: PHPUnit with Pest
- **API**: RESTful API architecture

### Frontend
- **Framework**: React with Vite
- **State Management**: React Query
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with modern design

## Prerequisites

- Docker and Docker Compose
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task-manager
   ```

2. Copy environment files:
   ```bash
   cp .env.example .env
   ```

3. Configure environment variables:
   
   `.env` file in the root directory with the following required variables:
   ```env
   # API Configuration
   API_URL=http://localhost:8000
   APP_URL=http://localhost:8000

   # Database Configuration
   DB_HOST=db
   DB_PORT=3306
   DB_DATABASE=db
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   MYSQL_ROOT_PASSWORD=your_root_password
   ```

   Note: All environment variables are required and must be explicitly set. The application will not start if any of these variables are missing.

4. Start the Docker containers:
   ```bash
   docker compose up -d
   ```

   This will start:
   - Frontend (React) at http://localhost:3000
   - Backend (Laravel) at http://localhost:8000
   - MySQL database at localhost:3307
   - Nginx web server
``

The application should now be running at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Application Structure

### Backend (Laravel)
- `app/Http/Controllers/Api` - API controllers
- `app/Models` - Eloquent models
- `app/Services` - Business logic services
- `app/Repositories` - Data access layer
- `database/migrations` - Database migrations
- `routes/api.php` - API routes
- `tests` - Feature and unit tests

### Frontend (React)
- `src/components` - React components
- `src/hooks` - Custom React hooks
- `src/services` - API services
- `src/schemas` - Validation schemas
- `src/constants` - Application constants

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout (requires authentication)

### Tasks
- `GET /api/tasks` - List all tasks (with search and filter)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

## Testing

### Backend Tests
```bash
docker compose exec backend php artisan test
```

## Development

### Environment Variables
All environment variables are required for the application to function. There are no default fallback values. Make sure to set these variables before starting the application:

- `API_URL`: The URL where the API is accessible
- `APP_URL`: The URL where the Laravel application is accessible
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_DATABASE`: Database name
- `DB_USERNAME`: Database user
- `DB_PASSWORD`: Database password
- `MYSQL_ROOT_PASSWORD`: MySQL root password

## Default Users

After seeding the database, you can use these default users:

1. Admin User
   - Email: admin@example.com
   - Password: password123

2. Regular User
   - Email: user@example.com
   - Password: password123

## License

This project is licensed under the MIT License - see the LICENSE file for details 